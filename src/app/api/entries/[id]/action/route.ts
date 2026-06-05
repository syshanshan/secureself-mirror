import { NextRequest, NextResponse } from "next/server";
import { isValidAnxietyIntensity } from "@/lib/action-anxiety";
import { isSupabaseConfigured, updateMirrorEntryAction } from "@/lib/supabase";
import type { CompleteActionRequest, MoodAfterAction } from "@/types/analysis";

const VALID_MOODS: MoodAfterAction[] = [
  "calm",
  "relaxed",
  "still_anxious",
  "sad",
  "empowered",
  "clearer",
];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestStartedAt = new Date().toISOString();

  try {
    const { id } = await params;
    const body = (await request.json()) as CompleteActionRequest;

    console.log("[PATCH /api/entries/[id]/action] request received", {
      at: requestStartedAt,
      incomingEntryId: id,
      isLocalEntry: id.startsWith("local-"),
      sessionId: body.sessionId,
      actionCompleted: body.actionCompleted,
      selectedSelfCareStep: body.selectedSelfCareStep,
    });
    console.log("[PATCH /api/entries/[id]/action] full body", body);

    if (!body.sessionId?.trim()) {
      return NextResponse.json(
        { success: false, error: "Session is required." },
        { status: 400 }
      );
    }

    if (!body.selectedSelfCareStep?.trim()) {
      return NextResponse.json(
        { success: false, error: "Self-care step is required." },
        { status: 400 }
      );
    }

    if (!VALID_MOODS.includes(body.moodAfterAction)) {
      return NextResponse.json(
        { success: false, error: "Invalid mood." },
        { status: 400 }
      );
    }

    if (!isValidAnxietyIntensity(body.anxietyBefore)) {
      return NextResponse.json(
        { success: false, error: "Anxiety before must be between 1 and 10." },
        { status: 400 }
      );
    }

    if (!isValidAnxietyIntensity(body.anxietyAfter)) {
      return NextResponse.json(
        { success: false, error: "Anxiety after must be between 1 and 10." },
        { status: 400 }
      );
    }

    if (id.startsWith("local-")) {
      return NextResponse.json({
        success: true,
        source: "local" as const,
      });
    }

    if (!isSupabaseConfigured()) {
      console.warn("[PATCH /api/entries/[id]/action] Supabase not configured", {
        incomingEntryId: id,
      });
      return NextResponse.json(
        {
          success: false,
          error: "Supabase is not configured on the server.",
          fallback: "local" as const,
        },
        { status: 200 }
      );
    }

    const entry = await updateMirrorEntryAction(id, {
      sessionId: body.sessionId.trim(),
      selectedSelfCareStep: body.selectedSelfCareStep.trim(),
      actionCompleted: body.actionCompleted ?? true,
      moodBeforeAction: body.moodBeforeAction?.trim() ?? "",
      moodAfterAction: body.moodAfterAction,
      reflectionAfterAction: body.reflectionAfterAction?.trim() ?? "",
      anxietyBefore: body.anxietyBefore,
      anxietyAfter: body.anxietyAfter,
      anxietyReduction: body.anxietyReduction,
      completedAt: body.completedAt ?? new Date().toISOString(),
    });

    if (!entry) {
      console.warn("[PATCH /api/entries/[id]/action] update failed — see [action-update] logs above", {
        incomingEntryId: id,
        result: "no entry returned (0 rows or error)",
        clientFallback: "localStorage",
      });
      return NextResponse.json(
        {
          success: false,
          error:
            "Could not save action completion. No row was updated — verify the entry id and Supabase update policy.",
          fallback: "local" as const,
        },
        { status: 200 }
      );
    }

    console.log("[PATCH /api/entries/[id]/action] success", {
      incomingEntryId: id,
      savedEntryId: entry.id,
      actionCompleted: entry.actionCompleted,
      completedAt: entry.completedAt,
    });

    return NextResponse.json({
      success: true,
      source: "supabase" as const,
      entry,
    });
  } catch (error) {
    console.error("[PATCH /api/entries/[id]/action] unhandled error", error);
    return NextResponse.json(
      {
        success: false,
        error: "Could not save action completion.",
        fallback: "local" as const,
      },
      { status: 200 }
    );
  }
}
