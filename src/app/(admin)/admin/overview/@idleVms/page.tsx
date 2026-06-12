import { cachedGetFleetOverview, cachedGetAllVms } from "@/lib/api/cached";
import { MOCK_USERS } from "@/mocks/users";
import { IdleVmsTable } from "@/components/overview/idle-vms-table";

const IDLE_LAST_ACTIVE_MS = 14 * 24 * 60 * 60 * 1000;

function lastActiveOlderThan14Days(iso: string): boolean {
  if (!iso) return false;
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return false;
  return Date.now() - t > IDLE_LAST_ACTIVE_MS;
}

export default async function IdleVmsPage() {
  const [{ data: fleet }, { data: vms }] = await Promise.all([
    cachedGetFleetOverview(),
    cachedGetAllVms(),
  ]);

  const vmById = Object.fromEntries(vms.map((v) => [v.id, v]));
  const userById = Object.fromEntries(MOCK_USERS.map((u) => [u.id, u]));

  const rows = fleet.vmMetrics
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
    .flatMap((m) => {
      const vm = vmById[m.vmId];
      if (!vm) return [];
      const user = userById[vm.ownerId];
      return [{ vm, ownerName: user?.name ?? vm.ownerId, ownerId: vm.ownerId }];
    });

  return <IdleVmsTable rows={rows} />;
}
