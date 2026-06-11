import Link from "next/link";
import { cachedGetFleetOverview, cachedGetAllVms } from "@/lib/api/cached";
import { MOCK_USERS } from "@/mocks/users";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { utilizationColor } from "@/lib/utils/format";
import { cn } from "@/lib/utils";
import type { VMStatus } from "@/types";

function CpuBar({ value }: { value: number }) {
  const barColor =
    value >= 85 ? "bg-destructive" : value >= 70 ? "bg-amber-400" : "bg-emerald-400";
  return (
    <div className="flex items-center gap-2 min-w-0">
      <span className={cn("tabular-nums shrink-0 w-7 text-right", utilizationColor(value))}>
        {value}%
      </span>
      <div className="flex-1 bg-muted rounded-full h-1.5 min-w-[40px]">
        <div className={cn("h-full rounded-full transition-all", barColor)} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export default async function HotVmsPage() {
  const [{ data: fleet }, { data: vms }] = await Promise.all([
    cachedGetFleetOverview(),
    cachedGetAllVms(),
  ]);

  const vmById = Object.fromEntries(vms.map((v) => [v.id, v]));
  const userById = Object.fromEntries(MOCK_USERS.map((u) => [u.id, u.name]));

  const hotVms = fleet.vmMetrics
    .filter((m) => m.status === "running" && m.cpuPercent > 0)
    .sort((a, b) => b.cpuPercent - a.cpuPercent)
    .slice(0, 5)
    .map((m) => {
      const vm = vmById[m.vmId];
      return {
        vmId: m.vmId,
        name: vm?.name ?? m.vmId,
        ownerName: vm ? (userById[vm.ownerId] ?? vm.ownerId) : "—",
        cpuPercent: m.cpuPercent,
      };
    });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle>Top CPU Utilization (Hot VMs)</CardTitle>
          <Link
            href="/admin/fleet?sort=cpuUsagePercent&dir=desc"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            View all →
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-[1fr_auto_minmax(80px,1.5fr)] gap-x-3 mb-2">
          <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">VM</div>
          <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Owner</div>
          <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">CPU</div>
        </div>
        {hotVms.length === 0 ? (
          <p className="text-muted-foreground text-sm py-4 text-center">No hot VMs.</p>
        ) : (
          <div>
            {hotVms.map((m) => (
              <div
                key={m.vmId}
                className="grid grid-cols-[1fr_auto_minmax(80px,1.5fr)] gap-x-3 items-center py-2 border-b border-border/40 last:border-0 text-xs"
              >
                <span className="font-mono truncate">{m.name}</span>
                <span className="text-muted-foreground whitespace-nowrap">{m.ownerName}</span>
                <CpuBar value={m.cpuPercent} />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
