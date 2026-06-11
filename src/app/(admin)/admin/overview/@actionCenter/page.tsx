import { ActionCenter } from "@/components/overview/action-center";
import { MOCK_ALERTS } from "@/mocks/alerts";

export default function ActionCenterPage() {
  return <ActionCenter alerts={MOCK_ALERTS} />;
}
