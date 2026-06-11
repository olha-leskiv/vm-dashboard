import { cachedGetFleetOverview, cachedGetAllVms } from "@/lib/api/cached";
import { MOCK_USERS } from "@/mocks/users";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime } from "@/lib/utils/format";
import { cn } from "@/lib/utils";
import type { VMStatus } from "@/types";

const STATUS_STYLES: Record<VMStatus, string> = {
  running: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  stopped: "bg-muted text-muted-foreground border-transparent",
  starting: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  stopping: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  error: "bg-destructive/10 text-destructive border-destructive/20",
};

export default async function IdleVmsPage() {
  const [{ data: fleet }, { data: vms }] = await Promise.all([
    cachedGetFleetOverview(),
    cachedGetAllVms(),
  ]);

  const vmById = Object.fromEntries(vms.map((v) => [v.id, v]));
  const userById = Object.fromEntries(MOCK_USERS.map((u) => [u.id, u.name]));

  const idleVms = fleet.vmMetrics
    .filter((m) => m.status === "stopped" || m.status === "error" || m.cpuPercent <= 10)
    .sort((a, b) => a.cpuPercent - b.cpuPercent)
    .slice(0, 5)
    .map((m) => {
      const vm = vmById[m.vmId];
      return {
        vmId: m.vmId,
        name: vm?.name ?? m.vmId,
        ownerName: vm ? (userById[vm.ownerId] ?? vm.ownerId) : "—",
        lastActiveAt: vm?.lastActiveAt ?? "",
        status: m.status,
      };
    });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Idle VMs</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-[1fr_auto_auto] gap-x-3 mb-2">
          <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">VM</div>
          <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Owner</div>
          <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Last Activity</div>
        </div>
        {idleVms.length === 0 ? (
          <p className="text-muted-foreground text-sm py-4 text-center">No idle VMs.</p>
        ) : (
          <div>
            {idleVms.map((m) => (
              <div
                key={m.vmId}
                className="grid grid-cols-[1fr_auto_auto] gap-x-3 items-center py-2 border-b border-border/40 last:border-0 text-xs"
              >
                <span className="font-mono truncate">{m.name}</span>
                <span className="text-muted-foreground whitespace-nowrap">{m.ownerName}</span>
                <div className="flex items-center gap-1.5">
                  {m.lastActiveAt && (
                    <span className="text-muted-foreground whitespace-nowrap">
                      {formatRelativeTime(m.lastActiveAt)}
                    </span>
                  )}
                  <Badge
                    variant="outline"
                    className={cn("text-[10px] py-0 h-4 px-1.5 shrink-0", STATUS_STYLES[m.status])}
                  >
                    {m.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
