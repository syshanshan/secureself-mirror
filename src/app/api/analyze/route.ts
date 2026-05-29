import { NextRequest, NextResponse } from "next/server";
import { analyzeMessage } from "@/lib/openai";
import { isSupabaseConfigured, saveMirrorEntry } from "@/lib/supabase";
import type { AnalyzeRequest } from "@/types/analysis";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as AnalyzeRequest;

    if (!body.situation?.trim() || !body.message?.trim()) {
      return NextResponse.json(
        { success: false, error: "Situation and message are required" },
        { status: 400 }
      );
    }

    const result = await analyzeMessage(
      body.situation.trim(),
      body.message.trim()
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
          error instanceof Error ? error.message : "Failed to analyze message",
      },
      { status: 500 }
    );
  }
}
