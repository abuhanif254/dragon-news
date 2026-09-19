import { incrementReaction } from "@/lib/firestore";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const { articleId, reactionId } = body;
    const incrementBy = body.incrementBy === -1 ? -1 : 1;

    if (!articleId || !reactionId || typeof articleId !== "string" || typeof reactionId !== "string") {
      return NextResponse.json({ error: "Invalid or missing required fields" }, { status: 400 });
    }

    // Reaction ID whitelist check (prevent arbitrary property injection)
    if (!/^[a-zA-Z0-9_-]{1,30}$/.test(reactionId)) {
      return NextResponse.json({ error: "Invalid reaction identifier" }, { status: 400 });
    }

    await incrementReaction(articleId, reactionId, incrementBy);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating reaction:", error);
    return NextResponse.json({ error: "Failed to update reaction" }, { status: 500 });
  }
}
