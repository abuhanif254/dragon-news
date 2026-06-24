import { NextResponse } from "next/server";

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

    // Verify Firebase ID token on the server
    // In production, you should verify the token with Firebase Admin SDK
    // For now, we'll accept the token and create a session
    
    return NextResponse.json({
      status: true,
      token: idToken,
      message: "Login successful",
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { status: false, message: "Authentication failed" },
      { status: 401 }
    );
  }
}
