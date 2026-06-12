import type { ApiResponse, Alert, FleetUtilization, VM, VMTemplate } from "@/types";
import { apiFetch } from "./client";

export async function getFleetOverview(): Promise<ApiResponse<FleetUtilization>> {
  return apiFetch<ApiResponse<FleetUtilization>>("/api/admin/fleet");
}

export async function getAllVms(): Promise<ApiResponse<VM[]>> {
  return apiFetch<ApiResponse<VM[]>>("/api/admin/vms");
}

export async function getTemplates(): Promise<ApiResponse<VMTemplate[]>> {
  return apiFetch<ApiResponse<VMTemplate[]>>("/api/admin/templates");
}

export async function getAlerts(): Promise<ApiResponse<Alert[]>> {
  return apiFetch<ApiResponse<Alert[]>>("/api/admin/alerts");
}
