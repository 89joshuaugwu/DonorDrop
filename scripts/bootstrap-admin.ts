import 'dotenv/config';
import { adminAuth } from "../lib/firebase-admin";

async function main() {
  const user = await adminAuth().getUserByEmail("admin@donordrop.com");
  await adminAuth().setCustomUserClaims(user.uid, { admin: true });
  console.log("Admin claim set for", user.email);
}

main();
