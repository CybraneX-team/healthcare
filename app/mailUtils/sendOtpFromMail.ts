import { db } from "@/utils/firebase";
import { Timestamp, setDoc, doc } from "firebase/firestore";
import { sendEmail } from "@/app/mailUtils/sendEmail"; // adjust path if needed

export async function sendOtpToEmail(uid: string, email: string) {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Timestamp.fromDate(new Date(Date.now() + 5 * 60 * 1000));

  await setDoc(doc(db, "otpCodes", uid), {
    uid,
    code,
    expiresAt
  });

  // 🔄 Call your API route
  await fetch("/api/send-email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      to: email,
      subject: "Your 2FA Login Code",
      text: `Your 2FA code is: ${code}. It will expire in 5 minutes.`
    })
  });
}
