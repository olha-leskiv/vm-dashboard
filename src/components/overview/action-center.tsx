import { AlertCircle, AlertTriangle, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatRelativeTime } from "@/lib/utils/format";
import type { Alert } from "@/types";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

function SeverityIcon({ severity }: { severity: Alert["severity"] }) {
  if (severity === "critical") {
    return <AlertCircle className="size-3.5 shrink-0 text-destructive mt-px" />;
  }
  return <AlertTriangle className="size-3.5 shrink-0 text-amber-400 mt-px" />;
}

interface Props {
  alerts: Alert[];
}

export function ActionCenter({ alerts }: Props) {
  const criticalCount = alerts.filter((a) => a.severity === "critical").length;
  const warningCount = alerts.filter((a) => a.severity === "warning").length;
  const displayed = alerts.slice(0, 3);

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <CardTitle>Action Center</CardTitle>
            <Tooltip>
              <TooltipTrigger aria-label="About action center alerts">
                <Info className="size-3.5 text-muted-foreground/50 hover:text-muted-foreground cursor-help" aria-hidden="true" />
              </TooltipTrigger>
              <TooltipContent>Active alerts requiring admin attention</TooltipContent>
            </Tooltip>
          </div>
          <div className="flex items-center gap-1.5">
            {criticalCount > 0 && (
              <Badge variant="outline" className="text-[10px] h-5 px-1.5 bg-destructive/10 text-destructive border-destructive/20 gap-1">
                <AlertCircle className="size-3" />
                {criticalCount} Critical
              </Badge>
            )}
            {warningCount > 0 && (
              <Badge variant="outline" className="text-[10px] h-5 px-1.5 bg-amber-500/10 text-amber-400 border-amber-500/20 gap-1">
                <AlertTriangle className="size-3" />
                {warningCount} Warning{warningCount !== 1 ? "s" : ""}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-0">
        {displayed.length === 0 ? (
          <EmptyState message="No active alerts." description="The fleet is healthy." />
        ) : (
          <div>
            {displayed.map((alert) => (
              <div
                key={alert.id}
                className="flex items-start gap-2.5 py-2.5 border-b border-border/40 last:border-0"
              >
                <SeverityIcon severity={alert.severity} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium leading-snug">{alert.message}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{alert.detail}</p>
                </div>
                <span className="text-[11px] text-muted-foreground shrink-0 tabular-nums">
                  {formatRelativeTime(alert.timestamp)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* footer actions */}
        <div className="flex items-center justify-between pt-2 mt-1 border-t border-border/40">
          <span className="text-xs text-muted-foreground">Active alerts</span>
          <Button variant="ghost" size="xs">
            View all events
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
