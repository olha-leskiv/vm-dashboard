import { cachedGetFleetOverview } from "@/lib/api/cached";
import { UtilizationDistribution } from "@/components/overview/utilization-distribution";

export default async function RunningVmsPage() {
  const { data: fleet } = await cachedGetFleetOverview();

  const metrics = fleet.vmMetrics.map((m) => ({
    cpu: m.cpuPercent,
    memory: m.memoryPercent,
  }));

  return <UtilizationDistribution metrics={metrics} totalVms={fleet.totalVms} />;
}
