"use client";

import { MachineCard } from "@/components/vms/machine-card";
import { useDeveloperMachines } from "@/lib/query/hooks";
import { EmptyState } from "@/components/ui/empty-state";

export function MachinesList() {
  const { data } = useDeveloperMachines();
  const vms = data.data;

  if (vms.length === 0) {
    return (
      <EmptyState
        message="No machines found."
        description="You don't have any virtual machines assigned yet."
        className="py-12"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {vms.map((vm) => (
        <MachineCard key={vm.id} vm={vm} />
      ))}
    </div>
  );
}
