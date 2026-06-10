import type { ApiResponse, VM } from "@/types";
import { apiFetch } from "./client";

export async function getDeveloperMachines(): Promise<ApiResponse<VM[]>> {
  return apiFetch<ApiResponse<VM[]>>("/api/developer/machines");
}
