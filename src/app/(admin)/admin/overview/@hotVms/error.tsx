"use client";

import { ErrorRetryPanel } from "@/components/ui/error-retry-panel";

export default function HotVmsError({ reset }: { error: Error; reset: () => void }) {
  return <ErrorRetryPanel message="Failed to load hot VMs." onRetry={reset} />;
}
