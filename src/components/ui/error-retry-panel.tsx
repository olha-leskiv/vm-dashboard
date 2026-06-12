"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

export interface ErrorRetryPanelProps {
  message: React.ReactNode;
  onRetry: () => void;
  retryLabel?: string;
  /** When set and `variant` is `centered`, shows `error.message` below the main message. */
  error?: Error & { digest?: string };
  variant?: "card" | "centered";
  className?: string;
}

export function ErrorRetryPanel({
  message,
  onRetry,
  retryLabel = "Retry",
  error,
  variant = "card",
  className,
}: ErrorRetryPanelProps) {
  const retryButton = (
    <Button
      type="button"
      size="xs"
      onClick={onRetry}
    >
      {retryLabel}
    </Button>
  );

  if (variant === "centered") {
    return (
      <div
        className={cn(
          "flex h-64 flex-col items-center justify-center gap-4 text-center",
          className
        )}
      >
        <p className="text-sm text-muted-foreground">{message}</p>
        {error ? (
          <p className="font-mono text-xs text-muted-foreground/60">{error.message}</p>
        ) : null}
        {retryButton}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "space-y-2 rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center flex flex-col items-center justify-center",
        className
      )}
    >
      <AlertCircle className="size-6 text-destructive mb-2" />
      <p className="text-destructive">{message}</p>
      {retryButton}
    </div>
  );
}
