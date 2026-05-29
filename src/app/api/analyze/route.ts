import { NextRequest, NextResponse } from "next/server";
import { analyzeMessage } from "@/lib/openai";
import { isSupabaseConfigured, saveMirrorEntry } from "@/lib/supabase";
import { translations } from "@/lib/i18n/translations";
import type { AnalyzeRequest } from "@/types/analysis";
import type { Language } from "@/lib/i18n/types";

function resolveLanguage(value: unknown): Language {
  return value === "zh" ? "zh" : "en";
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as AnalyzeRequest;
    const language = resolveLanguage(body.language);
    const t = translations[language];

    if (!body.situation?.trim() || !body.message?.trim()) {
      return NextResponse.json(
        { success: false, error: t.api.requiredFields },
        { status: 400 }
      );
    }

    const result = await analyzeMessage(
      body.situation.trim(),
      body.message.trim(),
      language
    );

    const sessionId = body.sessionId?.trim() || crypto.randomUUID();

    let id: string;
    let source: "supabase" | "local";

    if (isSupabaseConfigured()) {
      const savedId = await saveMirrorEntry({
        sessionId,
        situation: body.situation.trim(),
        originalMessage: body.message.trim(),
        result,
      });

      if (savedId) {
        id = savedId;
        source = "supabase";
      } else {
        id = `local-${crypto.randomUUID()}`;
        source = "local";
      }
    } else {
      id = `local-${crypto.randomUUID()}`;
      source = "local";
    }

    return NextResponse.json({
      success: true,
      data: result,
      id,
      sessionId,
      source,
    });
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : translations.en.api.analysisFailed,
      },
      { status: 500 }
    );
  }
}
