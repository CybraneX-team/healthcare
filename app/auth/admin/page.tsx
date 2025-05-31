"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation"; // Use the Next.js router for redirects
import { auth } from "@/utils/firebase";

export default function PromoteToAdminForm() {
  const [key, setKey] = useState("");
  const [loading, setLoading] = useState(false); // Track loading state
  const router = useRouter(); // Get router instance

  const promote = async () => {
    setLoading(true); // Start loading
    try {
      const idToken = await auth.currentUser?.getIdToken();
      if (!idToken) {
        alert("Not logged in!");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/promote-to-admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`
        },
        body: JSON.stringify({ promotionKey: key })
      });

      if (res.ok) {
        alert("You are now an admin!");
        router.push("/dashboard"); // Redirect on success
      } else {
        const { error } = await res.json();
        alert("Error: " + error);
      }
    } catch (error) {
      console.error(error);
      alert("An unexpected error occurred.");
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <div>
      <input
        type="password"
        placeholder="Enter promotion key"
        value={key}
        onChange={(e) => setKey(e.target.value)}
        className="border p-2"
        disabled={loading} // Disable input while loading
      />
      <button
        onClick={promote}
        className="bg-blue-600 text-white p-2 ml-2"
        disabled={loading} // Disable button while loading
      >
        {loading ? "Promoting..." : "Promote Me"} {/* Show loader text */}
      </button>
    </div>
  );
}
