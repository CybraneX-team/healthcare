// app/api/promote-to-admin/route.ts
import { NextRequest, NextResponse } from "next/server";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/utils/firebase";

export const POST = async (req: NextRequest) => {
  try {
    const { superuserPass, uid } = await req.json();
    const SUPERUSER_PASS = process.env.SUPERUSER_PASS;

    if (superuserPass !== SUPERUSER_PASS || !uid) {
      return NextResponse.json(
        { error: "Unauthorized or missing UID" },
        { status: 403 }
      );
    }

    // Directly update the user's Firestore doc
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, {
      role: "admin",
      updatedAt: new Date(),
    });

    return NextResponse.json({ message: "User promoted to admin!" }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
};
