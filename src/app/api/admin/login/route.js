import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";

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
    
    // Optionally check if user is admin
    // if (decodedToken.email !== "mohammadbitullah@gmail.com") {
    //   throw new Error("Unauthorized");
    // }

    return NextResponse.json({
      status: true,
      token: idToken,
      message: "Login successful",
      uid: decodedToken.uid
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { status: false, message: "Authentication failed" },
      { status: 401 }
    );
  }
}
