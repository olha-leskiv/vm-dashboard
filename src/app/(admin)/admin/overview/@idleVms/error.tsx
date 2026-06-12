"use client";

import { ErrorRetryPanel } from "@/components/ui/error-retry-panel";

export default function IdleVmsError({ reset }: { error: Error; reset: () => void }) {
  return <ErrorRetryPanel message="Failed to load idle VMs." onRetry={reset} />;
}
