import { cachedGetFleetOverview } from "@/lib/api/cached";
import { Card, CardContent } from "@/components/ui/card";
import { formatPercent, utilizationColor } from "@/lib/utils/format";
import type { FleetUtilization } from "@/types";
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
    <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-7 gap-3">
      <KpiCard label="Total VMs" value={fleet.totalVms} />
      <KpiCard label="Running VMs" value={fleet.runningVms} valueClass="text-emerald-400" />
      <KpiCard label="Starting" value={startingCount} valueClass="text-amber-400" />
      <KpiCard label="Stopped VMs" value={fleet.stoppedVms} valueClass="text-muted-foreground" />
      <KpiCard label="Total Users" value={fleet.totalUsers} />
      <KpiCard
        label="Avg CPU"
        value={formatPercent(fleet.avgCpuUtilizationPercent)}
        valueClass={utilizationColor(fleet.avgCpuUtilizationPercent)}
      />
      <KpiCard
        label="Avg Memory"
        value={formatPercent(fleet.avgMemoryUtilizationPercent)}
        valueClass={utilizationColor(fleet.avgMemoryUtilizationPercent)}
      />
    </div>
  );
}
