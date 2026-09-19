import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { createRateLimiter, getClientIp } from "@/lib/rate-limit";

// Rate limit: max 5 contact submissions per 15 minutes per IP
const contactLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  name: "contact",
});

function sanitizeText(str = "") {
  return String(str)
    .replace(/<[^>]*>?/gm, "") // Strip HTML tags
    .trim();
}

export async function POST(request) {
  try {
    const ip = getClientIp(request);

    // 1. IP Rate Limiting
    const limit = contactLimiter(ip);
    if (limit.isLimited) {
      return NextResponse.json(
        {
          success: false,
          error: "Too many messages sent. Please wait a few minutes before trying again.",
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { name, email, subject, message, hp_website } = body || {};

    // 2. Invisible Bot Honeypot Check
    if (hp_website && String(hp_website).trim().length > 0) {
      // Silently accept without saving to mislead spambots
      return NextResponse.json({
        success: true,
        message: "Message sent! We'll get back to you within 24 hours.",
      });
    }

    // 3. Validation
    const cleanName = sanitizeText(name);
    const cleanEmail = sanitizeText(email).toLowerCase();
    const cleanSubject = sanitizeText(subject);
    const cleanMessage = sanitizeText(message);

    if (!cleanName || cleanName.length < 2 || cleanName.length > 100) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid name (2–100 characters)." },
        { status: 400 }
      );
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail) || cleanEmail.length > 120) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (!cleanSubject || cleanSubject.length < 2 || cleanSubject.length > 200) {
      return NextResponse.json(
        { success: false, error: "Please enter a subject (2–200 characters)." },
        { status: 400 }
      );
    }

    if (!cleanMessage || cleanMessage.length < 20 || cleanMessage.length > 5000) {
      return NextResponse.json(
        { success: false, error: "Message must be between 20 and 5,000 characters." },
        { status: 400 }
      );
    }

    if (!db) {
      return NextResponse.json(
        { success: false, error: "Database service temporarily unavailable." },
        { status: 503 }
      );
    }

    // 4. Save to Firestore
    const docRef = await addDoc(collection(db, "messages"), {
      name: cleanName,
      email: cleanEmail,
      subject: cleanSubject,
      message: cleanMessage,
      timestamp: new Date().toISOString(),
      createdAt: serverTimestamp(),
      status: "unread",
      ip: ip !== "127.0.0.1" ? ip.slice(0, 24) : "local",
    });

    return NextResponse.json({
      success: true,
      id: docRef.id,
      message: "Message sent! We'll get back to you within 24 hours.",
    });
  } catch (error) {
    console.error("Contact API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send message. Please try again later." },
      { status: 500 }
    );
  }
}
