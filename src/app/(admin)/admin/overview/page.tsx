import { Suspense } from "react";
import { OverviewDashboard, OverviewSkeleton } from "@/components/overview/overview-dashboard";

export default function AdminOverviewPage() {
  return (
    <Suspense fallback={<OverviewSkeleton />}>
      <OverviewDashboard />
    </Suspense>
  );
}
