import { Suspense } from "react";
import { FleetDashboard, FleetSkeleton } from "@/components/fleet/fleet-dashboard";
import type { SortField, SortDir } from "@/components/fleet/fleet-dashboard";

const VALID_SORT_FIELDS = new Set([
  "name", "ownerId", "templateId", "status",
  "cpuUsagePercent", "memoryUsagePercent", "diskUsagePercent",
  "region", "lastActiveAt", "hourlyCost",
]);

export default async function FleetPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; sort?: string; dir?: string }>;
}) {
  const params = await searchParams;

  const initialStatus = params.status ?? "all";
  const initialSortField = VALID_SORT_FIELDS.has(params.sort ?? "")
    ? (params.sort as SortField)
    : "name";
  const initialSortDir: SortDir = params.dir === "desc" ? "desc" : "asc";

  return (
    <Suspense fallback={<FleetSkeleton />}>
      <FleetDashboard
        initialStatus={initialStatus}
        initialSortField={initialSortField}
        initialSortDir={initialSortDir}
      />
    </Suspense>
  );
}
