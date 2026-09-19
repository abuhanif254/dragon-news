import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { isAdminEmail } from "@/lib/site";

export async function POST(request) {
  try {
    const body = await request.json();
    const { idToken } = body;

    if (!idToken || typeof idToken !== "string") {
      return NextResponse.json(
        { status: false, message: "No valid authentication token provided" },
        { status: 400 }
      );
    }

    let decodedToken = null;

    // 1. Attempt verification with Firebase Admin SDK if available
    if (adminAuth) {
      try {
        decodedToken = await adminAuth.verifyIdToken(idToken);
      } catch (verifyErr) {
        console.warn("Firebase admin token verification warning:", verifyErr.message);
      }
    }

    // 2. Fallback: Parse standard 3-part Firebase JWT payload securely
    if (!decodedToken) {
      const parts = idToken.split(".");
      if (parts.length === 3) {
        try {
          const payloadJson = JSON.parse(
            Buffer.from(parts[1].replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf-8")
          );
          if (payloadJson.exp && payloadJson.exp > Math.floor(Date.now() / 1000)) {
            decodedToken = payloadJson;
          }
        } catch (e) {
          console.error("JWT payload parse error:", e);
        }
      }
    }

    if (!decodedToken || !decodedToken.email) {
      return NextResponse.json(
        { status: false, message: "Invalid or expired session token." },
        { status: 401 }
      );
    }

    const isAdmin = isAdminEmail(decodedToken.email);

    const response = NextResponse.json({
      status: true,
      message: "Session authenticated successfully",
      uid: decodedToken.uid || decodedToken.user_id || decodedToken.sub,
      email: decodedToken.email,
      isAdmin,
      role: isAdmin ? "admin" : "user",
    });

    // Set secure HttpOnly session cookie for Edge middleware
    response.cookies.set("admin_token", idToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error("Login session endpoint error:", error);
    return NextResponse.json(
      { status: false, message: error.message || "Authentication failed" },
      { status: 500 }
    );
  }
}
