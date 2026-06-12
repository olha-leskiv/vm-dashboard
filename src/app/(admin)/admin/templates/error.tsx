"use client";

import { ErrorRetryPanel } from "@/components/ui/error-retry-panel";

export default function TemplatesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorRetryPanel
      variant="centered"
      message="Failed to load templates."
      error={error}
      onRetry={reset}
      retryLabel="Try again"
    />
  );
}
