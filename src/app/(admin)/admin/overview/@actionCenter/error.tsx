"use client";

import { ErrorRetryPanel } from "@/components/ui/error-retry-panel";

export default function ActionCenterError({ reset }: { error: Error; reset: () => void }) {
  return (
    <ErrorRetryPanel message="Failed to load action center." onRetry={reset} />
  );
}
