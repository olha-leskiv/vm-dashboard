"use client";

import { useSuspenseQuery, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getDeveloperMachines, restartMachine, stopMachine, cancelMachine, getVmMetrics } from "@/lib/api/developer";
import { getFleetOverview, getAllVms, getTemplates } from "@/lib/api/admin";
import { queryKeys } from "./keys";

export function useDeveloperMachines() {
  return useSuspenseQuery({
    queryKey: queryKeys.developer.machines(),
    queryFn: getDeveloperMachines,
    refetchInterval: (query) => {
      const vms = query.state.data?.data ?? [];
      const transitioning = vms.some(
        (vm) => vm.status === "starting" || vm.status === "stopping"
      );
      return transitioning ? 3_000 : false;
    },
  });
}

export function useRestartMachine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: restartMachine,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.developer.machines() }),
  });
}

export function useStopMachine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: stopMachine,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.developer.machines() }),
  });
}

export function useCancelMachine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cancelMachine,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.developer.machines() }),
  });
}

export function useVmMetrics(vmId: string | null) {
  return useQuery({
    queryKey: queryKeys.vms.metrics(vmId ?? ""),
    queryFn: () => getVmMetrics(vmId!),
    enabled: !!vmId,
  });
}

export function useFleetOverview() {
  return useSuspenseQuery({
    queryKey: queryKeys.admin.fleet(),
    queryFn: getFleetOverview,
  });
}

export function useAllVms() {
  return useSuspenseQuery({
    queryKey: queryKeys.admin.vms(),
    queryFn: getAllVms,
  });
}

export function useTemplates() {
  return useSuspenseQuery({
    queryKey: queryKeys.admin.templates(),
    queryFn: getTemplates,
  });
}
