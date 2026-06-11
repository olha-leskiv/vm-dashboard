import { cachedGetFleetOverview } from "@/lib/api/cached";
import { Card, CardContent } from "@/components/ui/card";
import { FleetStatusCard } from "@/components/overview/fleet-status-card";
import { cn } from "@/lib/utils";

function KpiCard({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: React.ReactNode;
  valueClass?: string;
}) {
  return (
    <Card size="sm" className="min-w-0">
      <CardContent>
        <div className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground mb-2 leading-none">
          {label}
        </div>
        <div className={cn("text-2xl font-semibold tabular-nums tracking-tight", valueClass)}>
          {value}
        </div>
      </CardContent>
    </Card>
  );
}

export default async function KpisPage() {
  const { data: fleet } = await cachedGetFleetOverview();
  const startingCount = fleet.vmMetrics.filter((m) => m.status === "starting").length;

  return (
    <FleetStatusCard
      totalVms={fleet.totalVms}
      runningVms={fleet.runningVms}
      startingVms={startingCount}
      stoppedVms={fleet.stoppedVms}
    />
  );
}
