"use client";

import { MachineCard } from "@/components/vms/machine-card";
import { useDeveloperMachines } from "@/lib/query/hooks";

export function MachinesList() {
  const { data } = useDeveloperMachines();
  const vms = data.data;

  if (vms.length === 0) {
    return (
      <p className="text-muted-foreground text-sm py-12 text-center">No machines found.</p>
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
