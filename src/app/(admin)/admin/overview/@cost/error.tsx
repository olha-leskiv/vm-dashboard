"use client";

import { ErrorRetryPanel } from "@/components/ui/error-retry-panel";

export default function CostError({ reset }: { error: Error; reset: () => void }) {
  return (
    <ErrorRetryPanel message="Failed to load cost summary." onRetry={reset} />
  );
}
