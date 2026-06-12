import { cachedGetFleetOverview } from "@/lib/api/cached";
import { FleetStatusCard } from "@/components/overview/fleet-status-card";


export default async function KpisPage() {
  const { data: fleet } = await cachedGetFleetOverview();
  const startingCount = fleet.vmMetrics.filter((m) => m.status === "starting").length;

  return (
    <FleetStatusCard
      totalVms={fleet.totalVms}
      runningVms={fleet.runningVms}
      startingVms={startingCount}
      stoppedVms={fleet.stoppedVms}
    />
  );
}
