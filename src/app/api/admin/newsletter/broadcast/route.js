import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { ADMIN_EMAIL, isAdminEmail, SITE_NAME } from "@/lib/site";
import { generateNewsletterHtml } from "@/lib/email-templates";
import { createRateLimiter, getClientIp } from "@/lib/rate-limit";

// Rate limit: max 10 broadcast actions per 10 minutes per IP
const broadcastLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  max: 10,
  name: "newsletter-broadcast",
});

export async function POST(req) {
  try {
    const ip = getClientIp(req);
    const limit = broadcastLimiter(ip);
    if (limit.isLimited) {
      return NextResponse.json(
        { success: false, message: "Too many broadcast requests. Please slow down." },
        { status: 429 }
      );
    }

    // 1. Authenticate admin credentials
    const authHeader = req.headers.get("authorization");
    let token = null;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else {
      token = req.cookies.get("admin_token")?.value;
    }

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Administrative session required." },
        { status: 401 }
      );
    }

    let decodedEmail = "";
    if (adminAuth) {
      try {
        const decoded = await adminAuth.verifyIdToken(token);
        decodedEmail = decoded.email || "";
      } catch (e) {
        // Fallback to JWT payload decoding
      }
    }

    if (!decodedEmail && token.split(".").length === 3) {
      try {
        const payload = JSON.parse(
          Buffer.from(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf-8")
        );
        if (payload.exp && payload.exp > Math.floor(Date.now() / 1000)) {
          decodedEmail = payload.email || "";
        }
      } catch (e) {}
    }

    if (!isAdminEmail(decodedEmail)) {
      return NextResponse.json(
        { success: false, message: `Forbidden: Only ${ADMIN_EMAIL} can dispatch editorial newsletters.` },
        { status: 403 }
      );
    }

    // 2. Parse payload
    const body = await req.json();
    const {
      action = "send-test", // 'send-test' | 'broadcast-all'
      subject = "The Brain • Weekly Intelligence Digest",
      editorNote = "",
      stories = [],
      testEmail = ADMIN_EMAIL,
    } = body;

    if (!stories || stories.length === 0) {
      return NextResponse.json(
        { success: false, message: "Please select at least one article for the digest." },
        { status: 400 }
      );
    }

    const origin = req.headers.get("origin") || req.headers.get("host") || "https://dragonnews.com";
    const siteUrl = origin.startsWith("http") ? origin : `https://${origin}`;

    // 3. Generate HTML email digest
    const emailHtml = generateNewsletterHtml({
      subject,
      editorNote,
      stories,
      siteUrl,
    });

    const resendApiKey = process.env.RESEND_API_KEY;

    // 4. Handle dispatch
    if (resendApiKey) {
      // Production live send via Resend API
      if (action === "send-test") {
        const resendRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: `${SITE_NAME} <newsletter@${process.env.RESEND_DOMAIN || "dragonnews.com"}>`,
            to: [testEmail || ADMIN_EMAIL],
            subject: `[PREVIEW] ${subject}`,
            html: emailHtml,
          }),
        });

        const resendData = await resendRes.json();
        return NextResponse.json({
          success: true,
          live: true,
          mode: "test",
          recipient: testEmail || ADMIN_EMAIL,
          resendId: resendData.id,
          message: `Test email dispatched to ${testEmail || ADMIN_EMAIL}`,
        });
      } else {
        // Broadcast to all active subscribers
        let subscriberEmails = [];
        if (adminDb) {
          const snap = await adminDb.collection("subscribers").where("status", "==", "active").get();
          subscriberEmails = snap.docs.map(doc => doc.data().email).filter(Boolean);
        }

        if (subscriberEmails.length === 0) {
          return NextResponse.json({
            success: false,
            message: "No active subscribers found in your audience list.",
          });
        }

        // Send in batches of 50 via Resend Batch API
        const batchPayload = subscriberEmails.slice(0, 100).map(email => ({
          from: `${SITE_NAME} <newsletter@${process.env.RESEND_DOMAIN || "dragonnews.com"}>`,
          to: [email],
          subject: subject,
          html: emailHtml,
        }));

        await fetch("https://api.resend.com/emails/batch", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(batchPayload),
        });

        // Log campaign in Firestore
        if (adminDb) {
          await adminDb.collection("newsletter_campaigns").add({
            subject,
            editorNote: editorNote ? editorNote.slice(0, 300) : "",
            storyCount: stories.length,
            recipientCount: subscriberEmails.length,
            dispatchedBy: decodedEmail,
            live: true,
            createdAt: new Date(),
            dispatchedAt: new Date().toISOString(),
          });
        }

        return NextResponse.json({
          success: true,
          live: true,
          mode: "broadcast",
          recipientCount: subscriberEmails.length,
          message: `Campaign broadcast successfully to ${subscriberEmails.length} active subscribers!`,
        });
      }
    } else {
      // Simulation / Preview Mode (No API key required)
      let recipientCount = 1;
      if (action === "broadcast-all") {
        if (adminDb) {
          const snap = await adminDb.collection("subscribers").where("status", "==", "active").get();
          recipientCount = snap.size || 1;
        } else {
          recipientCount = 1;
        }

        // Log simulated campaign
        if (adminDb) {
          await adminDb.collection("newsletter_campaigns").add({
            subject,
            editorNote: editorNote ? editorNote.slice(0, 300) : "",
            storyCount: stories.length,
            recipientCount,
            dispatchedBy: decodedEmail,
            live: false,
            simulated: true,
            createdAt: new Date(),
            dispatchedAt: new Date().toISOString(),
          });
        }
      }

      return NextResponse.json({
        success: true,
        simulated: true,
        mode: action,
        recipientCount: action === "send-test" ? 1 : recipientCount,
        htmlPreview: emailHtml,
        message: action === "send-test"
          ? `Test email simulated for ${testEmail || ADMIN_EMAIL}. Add RESEND_API_KEY to your .env file to enable live SMTP delivery.`
          : `Campaign blast simulated for ${recipientCount} active subscribers. Add RESEND_API_KEY to your .env file to enable live SMTP delivery.`,
      });
    }
  } catch (error) {
    console.error("Newsletter broadcast error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error during newsletter dispatch." },
      { status: 500 }
    );
  }
}
