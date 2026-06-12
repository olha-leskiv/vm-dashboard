import { cachedGetAlerts } from "@/lib/api/cached";
import { ActionCenter } from "@/components/overview/action-center";

export default async function ActionCenterPage() {
  const { data: alerts } = await cachedGetAlerts();
  return <ActionCenter alerts={alerts} />;
}
