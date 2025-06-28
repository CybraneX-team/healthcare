import { db } from "@/utils/firebase";
import { getDoc, deleteDoc, doc } from "firebase/firestore";

export async function verifyOtpCode(uid: string, enteredCode: string) {
  const otpRef = doc(db, "otpCodes", uid);
  const otpDoc = await getDoc(otpRef);
  if (!otpDoc.exists()) throw new Error("No OTP found.");

  const { code, expiresAt } = otpDoc.data() as {
    code: string;
    expiresAt: { toDate: () => Date };
  };

  if (code !== enteredCode) throw new Error("Invalid OTP code.");
  if (expiresAt.toDate() < new Date()) throw new Error("OTP expired.");

  await deleteDoc(otpRef);
}
