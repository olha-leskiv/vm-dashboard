import { NextResponse } from "next/server";
import { MOCK_VMS } from "@/mocks/vms";
import type { ApiResponse, VM } from "@/types";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ vmId: string }> }
): Promise<NextResponse<ApiResponse<VM> | { error: string }>> {
  const { vmId } = await params;
  const vm = MOCK_VMS.find((v) => v.id === vmId);
  if (!vm) return NextResponse.json({ error: "Not found" }, { status: 404 });

  vm.status = "starting";
  vm.startedAt = null;
  vm.cpuUsagePercent = 0;
  vm.memoryUsagePercent = 0;

  // Simulate boot completing after 15 seconds
  setTimeout(() => {
    vm.status = "running";
    vm.startedAt = new Date().toISOString();
    vm.cpuUsagePercent = Math.floor(Math.random() * 30) + 5;
    vm.memoryUsagePercent = Math.floor(Math.random() * 30) + 20;
  }, 15_000);

  return NextResponse.json({ data: vm, meta: { timestamp: new Date().toISOString() } });
}
