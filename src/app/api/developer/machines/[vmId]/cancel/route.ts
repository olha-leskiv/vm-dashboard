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

  vm.status = "stopped";
  vm.startedAt = null;
  vm.cpuUsagePercent = 0;
  vm.memoryUsagePercent = 0;

  return NextResponse.json({ data: vm, meta: { timestamp: new Date().toISOString() } });
}
