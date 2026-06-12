import { NextResponse } from "next/server";
import { MOCK_FLEET_UTILIZATION } from "@/mocks/fleet";
import { simulateDelay } from "@/lib/utils/delay";
import type { ApiResponse, VmMetricTrendPoint } from "@/types";

export async function GET(): Promise<NextResponse<ApiResponse<VmMetricTrendPoint[]>>> {
  await simulateDelay();

  const trend: VmMetricTrendPoint[] = MOCK_FLEET_UTILIZATION.utilizationTrend.map((p) => ({
    timestamp: p.timestamp,
    cpuPercent: p.cpuPercent,
    memoryPercent: p.memoryPercent,
  }));

  return NextResponse.json({
    data: trend,
    meta: { timestamp: new Date().toISOString(), count: trend.length },
  });
}
