import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center text-center">
      <span className="mb-4 text-4xl">🌿</span>
      <h1 className="font-display text-xl font-semibold">Not found</h1>
      <p className="mt-2 text-sm text-text-muted">
        This reflection doesn&apos;t exist or may have been removed.
      </p>
      <Link href="/history" className="btn-primary mt-6 px-8 py-3">
        View History
      </Link>
    </div>
  );
}
