import { NextResponse } from "next/server";
import { getMirrorHistoryBySession, isSupabaseConfigured } from "@/lib/supabase";
import { translations } from "@/lib/i18n/translations";
import type { Language } from "@/lib/i18n/types";

function resolveLanguage(value: string | null): Language {
  return value === "zh" ? "zh" : "en";
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId")?.trim();
    const language = resolveLanguage(searchParams.get("language"));
    const t = translations[language];

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: t.api.sessionRequired },
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
      { success: false, error: translations.en.api.historyFailed },
      { status: 500 }
    );
  }
}
