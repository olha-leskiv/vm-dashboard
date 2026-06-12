"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { VmStatusIconChip } from "@/components/overview/vm-status-icon-chip";
import { Button } from "@/components/ui/button";
import { VmDrawer } from "@/components/vm-drawer";
import { formatRelativeTime } from "@/lib/utils/format";
import { EmptyState } from "@/components/ui/empty-state";
import type { VM } from "@/types";

interface IdleVmRow {
  vm: VM;
  ownerName: string;
  ownerId: string;
}

interface Props {
  rows: IdleVmRow[];
}

export function IdleVmsTable({ rows }: Props) {
  const router = useRouter();
  const [selectedVm, setSelectedVm] = useState<VM | null>(null);
  const selectedOwnerName = selectedVm
    ? (rows.find((r) => r.vm.id === selectedVm.id)?.ownerName ?? selectedVm.ownerId)
    : null;

  return (
    <>
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Idle VMs</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-0">
          {rows.length === 0 ? (
            <EmptyState message="No idle VMs." description="No running machines have been inactive for 14+ days." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[11px] uppercase tracking-wider h-7 px-0">VM</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wider h-7">Owner</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wider h-7">Last Active</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map(({ vm, ownerName, ownerId }) => (
                  <TableRow key={vm.id}>
                    <TableCell className="px-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <VmStatusIconChip status={vm.status} size="compact" />
                        <button
                          onClick={() => setSelectedVm(vm)}
                          aria-label={`View details for ${vm.name}`}
                          className="min-w-0 font-mono text-xs hover:text-foreground text-muted-foreground hover:underline underline-offset-2 transition-colors text-left"
                        >
                          {vm.name}
                        </button>
                      </div>
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          <div className="flex items-center justify-between pt-2 mt-1 border-t border-border/40">
            <span className="text-xs text-muted-foreground">Running, idle 14+ days</span>
            <Button variant="ghost" size="xs" aria-label="View all idle VMs" onClick={() => router.push("/admin/fleet?status=running&sort=lastActiveAt&dir=asc")}>
              View all
            </Button>
          </div>
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
