"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { getDeveloperMachines } from "@/lib/api/developer";
import { getFleetOverview, getAllVms, getTemplates } from "@/lib/api/admin";
import { queryKeys } from "./keys";

export function useDeveloperMachines() {
  return useSuspenseQuery({
    queryKey: queryKeys.developer.machines(),
    queryFn: getDeveloperMachines,
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
