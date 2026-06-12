"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { VmStatusIconChip } from "@/components/overview/vm-status-icon-chip";
import { VmDrawer } from "@/components/vm-drawer";
import { formatRelativeTime } from "@/lib/utils/format";
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
