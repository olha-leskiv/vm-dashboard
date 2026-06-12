import { cn } from "@/lib/utils";

interface EmptyStateProps {
  message: string;
  description?: string;
  action?: React.ReactNode;
  bordered?: boolean;
  className?: string;
}

export function EmptyState({ message, description, action, bordered, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 text-center",
        bordered
          ? "h-64 rounded-xl border border-dashed border-border px-6"
          : "py-6 px-4",
        className,
      )}
    >
      <p className="text-sm text-muted-foreground">{message}</p>
      {description && <p className="text-xs text-muted-foreground/70">{description}</p>}
      {action}
    </div>
  );
}
