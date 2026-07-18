export type BloodType = "O+" | "O-" | "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-";

export interface Donor {
  uid: string;
  name: string;
  phone: string;
  bloodType: BloodType;
  lat: number;
  lng: number;
  geohash: string;
  isVisible: boolean;
  verified: boolean;
  lastDonationDate: string | null; // ISO string, null if never donated
  totalDonations: number;
  pushToken?: string;
  createdAt: string;
}

export type RequestUrgency = "Critical" | "Urgent" | "Normal";
export type RequestStatus = "open" | "fulfilled" | "spam" | "cancelled";

export interface BloodRequest {
  id: string;
  requesterUid: string;
  requesterName: string;
  requesterPhone: string;
  bloodTypeNeeded: BloodType;
  units: number;
  urgency: RequestUrgency;
  hospitalName: string;
  lat: number;
  lng: number;
  geohash: string;
  notes?: string;
  status: RequestStatus;
  createdAt: string;
  fulfilledAt?: string;
}

export interface RequestResponse {
  donorUid: string;
  donorName: string;
  donorPhone: string;
  bloodType: BloodType;
  available: boolean;
  respondedAt: string;
}

export interface Donation {
  id: string;
  donorUid: string;
  location: string;
  loggedAt: string;
}

export interface AppUser {
  uid: string;
  email: string;
  role: "donor" | "requester" | "admin";
}
