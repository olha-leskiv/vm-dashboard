"use client";

import { ErrorRetryPanel } from "@/components/ui/error-retry-panel";

export default function FleetError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorRetryPanel
      message="Failed to load fleet data."
      error={error}
      onRetry={reset}
      retryLabel="Try again"
    />
  );
}
