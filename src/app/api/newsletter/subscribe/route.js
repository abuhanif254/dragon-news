import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { createRateLimiter, getClientIp } from "@/lib/rate-limit";

// Centralized IP rate limiter: max 5 attempts per 10 minutes per IP with auto-cleanup
const newsletterLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  max: 5,
  name: "newsletter-subscribe",
});

export async function POST(request) {
  try {
    const ip = getClientIp(request);

    // 1. IP Rate Limiting Check
    const limit = newsletterLimiter(ip);
    if (limit.isLimited) {
      return NextResponse.json(
        { status: "error", message: "Too many subscription attempts. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email, hp_website } = body || {};

    // 2. Bot Honeypot Check (Hidden input: if filled, drop silently)
    if (hp_website && String(hp_website).trim().length > 0) {
      return NextResponse.json({
        status: "success",
        message: "Thank you for subscribing to The Brain!",
      });
    }

    // 3. Email Syntax Validation
    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { status: "error", message: "Email address is required." },
        { status: 400 }
      );
    }

    const sanitizedEmail = email.trim().toLowerCase();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(sanitizedEmail) || sanitizedEmail.length > 100) {
      return NextResponse.json(
        { status: "error", message: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (!db) {
      return NextResponse.json(
        { status: "error", message: "Database service unavailable." },
        { status: 503 }
      );
    }

    // 4. Duplicate Check
    const subscribersRef = collection(db, "subscribers");
    const q = query(subscribersRef, where("email", "==", sanitizedEmail));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      return NextResponse.json({
        status: "exists",
        message: "You are already subscribed to The Brain newsletter!",
      });
    }

    // 5. Store New Subscriber
    await addDoc(subscribersRef, {
      email: sanitizedEmail,
      ip: ip !== "unknown-ip" ? ip.slice(0, 16) : "",
      subscribedAt: new Date().toISOString(),
      createdAt: serverTimestamp(),
      status: "active",
      source: "web-portal",
    });

    return NextResponse.json({
      status: "success",
      message: "Thank you for subscribing to The Brain newsletter!",
    });
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    return NextResponse.json(
      { status: "error", message: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
