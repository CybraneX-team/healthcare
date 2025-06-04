import * as admin from "firebase-admin";

// 1️⃣ Read the base64-encoded service account from environment
const base64 = process.env.GOOGLE_SERVICE_ACCOUNT_B64 ?? "";
if (!base64) {
  throw new Error("Missing GOOGLE_SERVICE_ACCOUNT_B64 in environment!");
}

// 2️⃣ Decode the base64 string and parse JSON
const serviceAccountJson = Buffer.from(base64, "base64").toString("utf-8");
const serviceAccount = JSON.parse(serviceAccountJson);

// 3️⃣ Initialize Firebase admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });
}

const adminApp = admin.app();
const adminAuth = admin.auth();
const adminDb = admin.firestore();

export { adminApp, adminAuth, adminDb };
