import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";

// Simple in-memory sliding-window IP rate limiter
const ipRequests = new Map();
const RATE_LIMIT_WINDOW = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS_PER_WINDOW = 5;

function isRateLimited(ip) {
  const now = Date.now();
  const timestamps = (ipRequests.get(ip) || []).filter((time) => now - time < RATE_LIMIT_WINDOW);

  if (timestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }

  timestamps.push(now);
  ipRequests.set(ip, timestamps);
  return false;
}

export async function POST(request) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown-ip";

    // 1. IP Rate Limiting Check
    if (isRateLimited(ip)) {
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
