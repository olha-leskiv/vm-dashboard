import { Suspense } from "react";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query/get-query-client";
import { getDeveloperMachines } from "@/lib/api/developer";
import { queryKeys } from "@/lib/query/keys";
import { MachinesList } from "@/components/vms/vm-list";
import { PageHeader } from "@/components/layout/page-header";

export default async function AdminMachinesPage() {
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: queryKeys.developer.machines(),
    queryFn: getDeveloperMachines,
  });

  return (
    <div className="space-y-6">
      <PageHeader title="My Machines" />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<p className="text-muted-foreground text-sm">Loading…</p>}>
          <MachinesList />
        </Suspense>
      </HydrationBoundary>
    </div>
  );
}
