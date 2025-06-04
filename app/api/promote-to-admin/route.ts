import { adminAuth, adminDb } from "@/lib/firebase-admin";

export const POST = async (req: Request) => {
  try {
    const { email, superuserPass } = await req.json();
    const idToken = req.headers.get("authorization")?.split("Bearer ")[1];
    const SUPERUSER_PASS = process.env.SUPERUSER_PASS;

    // Validate
    if (!idToken || superuserPass !== SUPERUSER_PASS) {
      return new Response(
        JSON.stringify({ error: "Unauthorized or invalid superuser password" }),
        { status: 403 }
      );
    }

    // Verify token
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // Promote to admin
    const userRef = adminDb.collection("users").doc(uid);
    await userRef.update({
      role: "admin",
      updatedAt: new Date()
    });

    return new Response(
      JSON.stringify({ message: "User promoted to admin!" }),
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ error: "Something went wrong" }),
      { status: 500 }
    );
  }
};
