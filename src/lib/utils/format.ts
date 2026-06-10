export function formatCost(usd: number): string {
  return `$${usd.toFixed(2)}/hr`;
}

export function formatPercent(n: number): string {
  return `${n}%`;
}

export function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function utilizationColor(percent: number): string {
  if (percent >= 85) return "text-destructive";
  if (percent >= 70) return "text-amber-400";
  return "text-muted-foreground";
}
