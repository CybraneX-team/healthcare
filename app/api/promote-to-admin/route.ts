import { NextApiRequest, NextApiResponse } from "next";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

export const POST = async (req: Request) => {
  // Next.js 13/14 uses Fetch API style
  const { promotionKey } = await req.json();
  const idToken = req.headers.get("authorization")?.split("Bearer ")[1];
  const ADMIN_PROMOTION_KEY = process.env.ADMIN_PROMOTION_KEY;

  if (!idToken || promotionKey !== ADMIN_PROMOTION_KEY) {
    return new Response(JSON.stringify({ error: "Unauthorized or invalid key" }), { status: 403 });
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    const userRef = adminDb.collection("users").doc(uid);
    await userRef.update({
      role: "admin",
      updatedAt: new Date()
    });

    return new Response(JSON.stringify({ message: "User promoted to admin!" }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Something went wrong" }), { status: 500 });
  }
};

