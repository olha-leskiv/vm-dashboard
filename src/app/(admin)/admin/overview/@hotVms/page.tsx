import { cachedGetFleetOverview, cachedGetAllVms } from "@/lib/api/cached";
import { MOCK_USERS } from "@/mocks/users";
import { HotVmsTable } from "@/components/overview/hot-vms-table";

export default async function HotVmsPage() {
  const [{ data: fleet }, { data: vms }] = await Promise.all([
    cachedGetFleetOverview(),
    cachedGetAllVms(),
  ]);

  const vmById = Object.fromEntries(vms.map((v) => [v.id, v]));
  const userById = Object.fromEntries(MOCK_USERS.map((u) => [u.id, u]));

  const rows = fleet.vmMetrics
    .filter((m) => m.status === "running" && m.cpuPercent > 0)
    .sort((a, b) => b.cpuPercent - a.cpuPercent)
    .slice(0, 5)
    .flatMap((m) => {
      const vm = vmById[m.vmId];
      if (!vm) return [];
      const user = userById[vm.ownerId];
      return [{ vm, ownerName: user?.name ?? vm.ownerId, ownerId: vm.ownerId }];
    });

  return <HotVmsTable rows={rows} />;
}
