"use client";

import { ErrorRetryPanel } from "@/components/ui/error-retry-panel";

export default function OverviewError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorRetryPanel
      variant="centered"
      message="Failed to load overview data."
      error={error}
      onRetry={reset}
      retryLabel="Try again"
    />
  );
}
