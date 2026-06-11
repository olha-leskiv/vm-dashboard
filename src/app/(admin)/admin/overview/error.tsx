"use client";

export default function OverviewError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
      <p className="text-muted-foreground text-sm">Failed to load overview data.</p>
      <p className="text-xs text-muted-foreground/60 font-mono">{error.message}</p>
      <button
        onClick={reset}
        className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
