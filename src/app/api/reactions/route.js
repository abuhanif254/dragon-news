import { incrementReaction } from "@/lib/firestore";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { articleId, reactionId, incrementBy } = await req.json();

    if (!articleId || !reactionId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await incrementReaction(articleId, reactionId, incrementBy);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating reaction:", error);
    return NextResponse.json({ error: "Failed to update reaction" }, { status: 500 });
  }
}
