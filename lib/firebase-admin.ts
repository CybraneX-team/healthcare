import * as admin from "firebase-admin";

// Load service account from ENV instead of file
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON!);

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
