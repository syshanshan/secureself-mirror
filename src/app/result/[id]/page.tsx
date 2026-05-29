import { getMirrorEntryById } from "@/lib/supabase";
import { ResultPageClient } from "./ResultPageClient";
import { notFound } from "next/navigation";

interface ResultPageProps {
  params: Promise<{ id: string }>;
}

export default async function ResultByIdPage({ params }: ResultPageProps) {
  const { id } = await params;

  if (id.startsWith("local-")) {
    return <ResultPageClient id={id} />;
  }

  const entry = await getMirrorEntryById(id);

  if (!entry) {
    notFound();
  }

  return (
    <ResultPageClient
      id={id}
      entry={entry}
    />
  );
}
