"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { VmDrawer } from "@/components/vm-drawer";
import { formatRelativeTime } from "@/lib/utils/format";
import { cn } from "@/lib/utils";
import type { VM, VMStatus } from "@/types";

const STATUS_STYLES: Record<VMStatus, string> = {
  running: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  stopped: "bg-muted text-muted-foreground border-transparent",
  starting: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  stopping: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  error: "bg-destructive/10 text-destructive border-destructive/20",
};

interface IdleVmRow {
  vm: VM;
  ownerName: string;
  ownerId: string;
}

interface Props {
  rows: IdleVmRow[];
}

export function IdleVmsTable({ rows }: Props) {
  const [selectedVm, setSelectedVm] = useState<VM | null>(null);
  const selectedOwnerName = selectedVm
    ? (rows.find((r) => r.vm.id === selectedVm.id)?.ownerName ?? selectedVm.ownerId)
    : null;

  return (
    <>
      <Card className="h-full">
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
          {rows.length === 0 ? (
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
                {rows.map(({ vm, ownerName, ownerId }) => (
                  <TableRow key={vm.id}>
                    <TableCell className="px-0">
                      <button
                        onClick={() => setSelectedVm(vm)}
                        className="font-mono text-xs hover:text-foreground text-muted-foreground hover:underline underline-offset-2 transition-colors text-left"
                      >
                        {vm.name}
                      </button>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/admin/users/${ownerId}`}
                        className="text-xs text-muted-foreground hover:text-foreground hover:underline underline-offset-2 transition-colors whitespace-nowrap"
                      >
                        {ownerName}
                      </Link>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {vm.lastActiveAt ? formatRelativeTime(vm.lastActiveAt) : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn("text-[10px] py-0 h-4 px-1.5", STATUS_STYLES[vm.status])}
                      >
                        {vm.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <VmDrawer
        vm={selectedVm}
        ownerName={selectedOwnerName}
        onClose={() => setSelectedVm(null)}
      />
    </>
  );
}
