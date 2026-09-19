import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { isAdminEmail } from "@/lib/site";
import { createRateLimiter, getClientIp } from "@/lib/rate-limit";

// Rate limit: max 20 login verification attempts per 15 minutes per IP
const loginLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  name: "login",
});

export async function POST(request) {
  try {
    const ip = getClientIp(request);
    const limit = loginLimiter(ip);
    if (limit.isLimited) {
      return NextResponse.json(
        { status: false, message: "Too many login attempts. Please try again in a few minutes." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { idToken } = body;

    if (!idToken || typeof idToken !== "string") {
      return NextResponse.json(
        { status: false, message: "No valid authentication token provided" },
        { status: 400 }
      );
    }

    let decodedToken = null;

    // Verify token cryptographic signature with Firebase Admin SDK
    // No fallback: if Admin SDK is unavailable, we cannot safely verify identity
    if (!adminAuth) {
      console.error("Firebase Admin SDK unavailable — cannot verify token signature.");
      return NextResponse.json(
        { status: false, message: "Authentication service temporarily unavailable. Please try again shortly." },
        { status: 503 }
      );
    }

    try {
      decodedToken = await adminAuth.verifyIdToken(idToken);
    } catch (verifyErr) {
      console.warn("Firebase admin token verification failed:", verifyErr.message);
      return NextResponse.json(
        { status: false, message: "Invalid or expired session token." },
        { status: 401 }
      );
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
