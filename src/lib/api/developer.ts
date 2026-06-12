import type { ApiResponse, VM, VmMetricTrendPoint } from "@/types";
import { apiFetch } from "./client";

export async function getDeveloperMachines(): Promise<ApiResponse<VM[]>> {
  return apiFetch<ApiResponse<VM[]>>("/api/developer/machines");
}

export async function restartMachine(vmId: string): Promise<ApiResponse<VM>> {
  return apiFetch<ApiResponse<VM>>(`/api/developer/machines/${vmId}/restart`, { method: "POST" });
}

export async function stopMachine(vmId: string): Promise<ApiResponse<VM>> {
  return apiFetch<ApiResponse<VM>>(`/api/developer/machines/${vmId}/stop`, { method: "POST" });
}

export async function cancelMachine(vmId: string): Promise<ApiResponse<VM>> {
  return apiFetch<ApiResponse<VM>>(`/api/developer/machines/${vmId}/cancel`, { method: "POST" });
}

export async function getVmMetrics(vmId: string): Promise<ApiResponse<VmMetricTrendPoint[]>> {
  return apiFetch<ApiResponse<VmMetricTrendPoint[]>>(`/api/vms/${vmId}/metrics`);
}
