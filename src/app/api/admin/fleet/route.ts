import { NextResponse } from "next/server";
import type { ApiResponse, FleetUtilization } from "@/types";
import { MOCK_FLEET_UTILIZATION } from "@/mocks/fleet";
import { simulateDelay } from "@/lib/utils/delay";

export async function GET(): Promise<NextResponse<ApiResponse<FleetUtilization>>> {
  await simulateDelay();
  return NextResponse.json({
    data: MOCK_FLEET_UTILIZATION,
    meta: { timestamp: new Date().toISOString() },
  });
}
