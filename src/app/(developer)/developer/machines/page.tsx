import { Suspense } from "react";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query/get-query-client";
import { getDeveloperMachines } from "@/lib/api/developer";
import { queryKeys } from "@/lib/query/keys";
import { DeveloperVmList } from "@/components/vms/vm-list";

export default async function DeveloperMachinesPage() {
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: queryKeys.developer.machines(),
    queryFn: getDeveloperMachines,
  });

  return (
    <div className="space-y-6">
      <h1>My Machines</h1>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<p className="text-muted-foreground">Loading…</p>}>
          <DeveloperVmList />
        </Suspense>
      </HydrationBoundary>
    </div>
  );
}
