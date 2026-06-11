import Link from "next/link";
import { cachedGetFleetOverview, cachedGetAllVms } from "@/lib/api/cached";
import { MOCK_USERS } from "@/mocks/users";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime } from "@/lib/utils/format";
import { cn } from "@/lib/utils";
import type { VMStatus } from "@/types";

/** Running VMs with no meaningful use in 2+ weeks (ms since last activity). */
const IDLE_LAST_ACTIVE_MS = 14 * 24 * 60 * 60 * 1000;

function lastActiveOlderThan14Days(iso: string): boolean {
  if (!iso) return false;
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return false;
  return Date.now() - t > IDLE_LAST_ACTIVE_MS;
}

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
    .filter((m) => {
      if (m.status !== "running") return false;
      const last = vmById[m.vmId]?.lastActiveAt ?? "";
      return lastActiveOlderThan14Days(last);
    })
    .sort((a, b) => {
      const ta = Date.parse(vmById[a.vmId]?.lastActiveAt ?? "") || 0;
      const tb = Date.parse(vmById[b.vmId]?.lastActiveAt ?? "") || 0;
      return ta - tb;
    })
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
        <div className="flex items-center justify-between gap-2">
          <CardTitle>Idle VMs</CardTitle>
          <Link
            href="/admin/fleet?status=running&sort=lastActiveAt&dir=asc"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            View all →
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {idleVms.length === 0 ? (
          <p className="text-muted-foreground text-sm py-4 text-center">
            No running VMs with last activity older than 14 days.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-[11px] uppercase tracking-wider h-7 px-0">VM</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wider h-7">Owner</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wider h-7">Last Active</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wider h-7">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {idleVms.map((m) => (
                <TableRow key={m.vmId}>
                  <TableCell className="font-mono text-xs px-0">{m.name}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{m.ownerName}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {m.lastActiveAt ? formatRelativeTime(m.lastActiveAt) : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn("text-[10px] py-0 h-4 px-1.5", STATUS_STYLES[m.status])}
                    >
                      {m.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
