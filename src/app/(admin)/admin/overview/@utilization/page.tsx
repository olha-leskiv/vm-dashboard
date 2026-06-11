import { cachedGetFleetOverview } from "@/lib/api/cached";
import { UtilizationChart } from "@/components/overview/utilization-chart";

export default async function UtilizationPage() {
  const { data: fleet } = await cachedGetFleetOverview();
  return <UtilizationChart trend={fleet.utilizationTrend} />;
}
