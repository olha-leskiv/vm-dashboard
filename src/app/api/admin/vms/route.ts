import { NextResponse } from "next/server";
import type { ApiResponse, VM } from "@/types";
import { MOCK_VMS } from "@/mocks/vms";
import { simulateDelay } from "@/lib/utils/delay";

export async function GET(): Promise<NextResponse<ApiResponse<VM[]>>> {
  await simulateDelay();
  return NextResponse.json({
    data: MOCK_VMS,
    meta: { timestamp: new Date().toISOString(), count: MOCK_VMS.length },
  });
}
