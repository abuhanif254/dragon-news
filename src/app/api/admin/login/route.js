import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { ADMIN_EMAIL, isAdminEmail } from "@/lib/site";

export async function POST(request) {
  try {
    const body = await request.json();
    const { idToken } = body;

    if (!idToken) {
      return NextResponse.json(
        { status: false, message: "No authentication token provided" },
        { status: 401 }
      );
    }

    // Verify Firebase ID token on the server using Firebase Admin SDK
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    
    // Verify that user is the authorized administrator
    if (!isAdminEmail(decodedToken.email)) {
      return NextResponse.json(
        { status: false, message: "Unauthorized: Admin privileges required." },
        { status: 403 }
      );
    }

    const response = NextResponse.json({
      status: true,
      message: "Login successful",
      uid: decodedToken.uid,
      email: decodedToken.email,
    });

    // Set secure HttpOnly cookie for session management
    response.cookies.set("admin_token", idToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { status: false, message: "Authentication failed" },
      { status: 401 }
    );
  }
}
