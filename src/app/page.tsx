import Link from "next/link";
import { Card } from "@/components/Card";

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blush">
          <span className="text-3xl">🪞</span>
        </div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-text">
          SecureSelf Mirror
        </h1>
        <p className="mt-2 text-text-muted">
          Transform anxious messages into secure, grounded communication
        </p>
      </header>

      <Card className="mb-6">
        <p className="leading-relaxed text-text">
          When attachment anxiety hits, your messages can come from fear instead
          of truth. This gentle space helps you pause, reflect, and rewrite —
          so you communicate from your secure self, not your activated nervous
          system.
        </p>
      </Card>

      <div className="mb-8 space-y-3">
        <FeatureItem
          emoji="💭"
          title="Share your situation"
          description="Describe what's happening in your relationship"
        />
        <FeatureItem
          emoji="✍️"
          title="Paste your draft message"
          description="The text you're about to send (or already sent)"
        />
        <FeatureItem
          emoji="🌸"
          title="Receive secure guidance"
          description="Pattern analysis, rewrite, boundaries & next steps"
        />
      </div>

      <Link
        href="/input"
        className="btn-primary mb-4 block py-4 text-center text-lg"
      >
        Start Reflecting
      </Link>

      <p className="text-center text-xs text-text-muted">
        You deserve relationships where you feel safe being yourself.
      </p>
    </div>
  );
}

function FeatureItem({
  emoji,
  title,
  description,
}: {
  emoji: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-card/60 px-4 py-3">
      <span className="text-xl">{emoji}</span>
      <div>
        <p className="font-medium text-text">{title}</p>
        <p className="text-sm text-text-muted">{description}</p>
      </div>
    </div>
  );
}
