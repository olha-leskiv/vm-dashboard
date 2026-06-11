import { Suspense } from "react";
import { FleetDashboard, FleetSkeleton } from "@/components/fleet/fleet-dashboard";

export default function FleetPage() {
  return (
    <Suspense fallback={<FleetSkeleton />}>
      <FleetDashboard />
    </Suspense>
  );
}
