import { NextResponse } from "next/server";
import { getMirrorHistoryBySession, isSupabaseConfigured } from "@/lib/supabase";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId")?.trim();

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: "Session is required." },
        { status: 400 }
      );
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        success: true,
        entries: [],
        source: "local" as const,
      });
    }

    const entries = await getMirrorHistoryBySession(sessionId);

    return NextResponse.json({
      success: true,
      entries,
      source: "supabase" as const,
    });
  } catch (err) {
    console.error("History error:", err);
    return NextResponse.json(
      { success: false, error: "Could not load your history." },
      { status: 500 }
    );
  }
}
