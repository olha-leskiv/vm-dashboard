"use client";

import { ErrorRetryPanel } from "@/components/ui/error-retry-panel";

export default function UtilizationError({ reset }: { error: Error; reset: () => void }) {
  return (
    <ErrorRetryPanel message="Failed to load fleet utilization." onRetry={reset} />
  );
}
