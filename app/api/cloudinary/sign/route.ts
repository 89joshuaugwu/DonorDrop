import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// Called by the mobile app (donordrop-app) to get a signature for direct
// signed uploads to Cloudinary — donor/request photo attachments if used.
// CORS is open here deliberately: this route is meant to be called from
// the Expo app's origin, which is different from this dashboard's origin.

function withCors(res: NextResponse) {
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return res;
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }));
}

export async function POST(request: NextRequest) {
  try {
    const { folder = "donordrop_uploads" } = await request.json().catch(() => ({}));

    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;

    if (!apiSecret || !apiKey || !cloudName) {
      return withCors(
        NextResponse.json({ error: "Cloudinary env vars missing on server" }, { status: 500 })
      );
    }

    cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });

    const timestamp = Math.round(Date.now() / 1000);
    const paramsToSign = { timestamp, folder };

    const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret);

    return withCors(
      NextResponse.json({
        signature,
        timestamp,
        cloudName,
        apiKey,
        folder,
      })
    );
  } catch (err) {
    console.error("Cloudinary sign error", err);
    return withCors(NextResponse.json({ error: "Failed to sign upload" }, { status: 500 }));
  }
}
