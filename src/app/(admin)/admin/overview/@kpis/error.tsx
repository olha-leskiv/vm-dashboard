"use client";

import { ErrorRetryPanel } from "@/components/ui/error-retry-panel";

export default function KpisError({ reset }: { error: Error; reset: () => void }) {
  return <ErrorRetryPanel message="Failed to load KPI metrics." onRetry={reset} />;
}
