import { NextResponse } from "next/server";
import type { ApiResponse, VM } from "@/types";
import { MOCK_VMS } from "@/mocks/vms";
import { CURRENT_USER_ID } from "@/mocks/users";
import { simulateDelay } from "@/lib/utils/delay";

export async function GET(): Promise<NextResponse<ApiResponse<VM[]>>> {
  await simulateDelay();
  const machines = MOCK_VMS.filter((vm) => vm.ownerId === CURRENT_USER_ID);
  return NextResponse.json({
    data: machines,
    meta: { timestamp: new Date().toISOString(), count: machines.length },
  });
}
