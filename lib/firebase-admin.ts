import * as admin from "firebase-admin";
import * as fs from "fs";

// Load service account key
const serviceAccount = JSON.parse(fs.readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS!, "utf-8"));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  });
}

const adminApp = admin.app();
const adminAuth = admin.auth();
const adminDb = admin.firestore();

export { adminApp, adminAuth, adminDb };