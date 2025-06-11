// lib/firebase.ts
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { AppOptions } from "firebase-admin";

const base64 = process.env.GOOGLE_SERVICE_ACCOUNT_B64 ?? "";
if (!base64) {
  throw new Error("Missing GOOGLE_SERVICE_ACCOUNT_B64 in environment!");
}
const serviceAccountJson = Buffer.from(base64, "base64").toString("utf-8");
const serviceAccount = JSON.parse(serviceAccountJson);

const adminConfig: AppOptions = {
  credential: cert(serviceAccount),
};

const app = !getApps().length ? initializeApp(adminConfig) : getApps()[0];
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
