import { cachedGetFleetOverview } from "@/lib/api/cached";
import { RunningVmsChart } from "@/components/overview/running-vms-chart";

export default async function RunningVmsPage() {
  const { data: fleet } = await cachedGetFleetOverview();
  return <RunningVmsChart trend={fleet.utilizationTrend} />;
}
