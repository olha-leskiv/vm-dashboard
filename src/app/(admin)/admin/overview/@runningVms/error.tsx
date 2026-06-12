"use client";

import { ErrorRetryPanel } from "@/components/ui/error-retry-panel";

export default function RunningVmsError({ reset }: { error: Error; reset: () => void }) {
  return (
    <ErrorRetryPanel message="Failed to load running VMs chart." onRetry={reset} />
  );
}
