interface LoadingSpinnerProps {
  message?: string;
}

export function LoadingSpinner({
  message = "Reflecting on your message...",
}: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      <div className="relative h-12 w-12">
        <div className="absolute inset-0 rounded-full border-2 border-blush-deep" />
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-rose" />
      </div>
      <p className="text-center text-sm text-text-muted">{message}</p>
    </div>
  );
}
