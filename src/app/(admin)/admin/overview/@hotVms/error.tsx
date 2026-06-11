"use client";

export default function HotVmsError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center space-y-2">
      <p className="text-sm text-muted-foreground">Failed to load hot VMs.</p>
      <button
        onClick={reset}
        className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors"
      >
        Retry
      </button>
    </div>
  );
}
