import { NextResponse } from "next/server";
import type { ApiResponse, Alert } from "@/types";
import { MOCK_ALERTS } from "@/mocks/alerts";
import { simulateDelay } from "@/lib/utils/delay";

export async function GET(): Promise<NextResponse<ApiResponse<Alert[]>>> {
  await simulateDelay();
  return NextResponse.json({
    data: MOCK_ALERTS,
    meta: { timestamp: new Date().toISOString(), count: MOCK_ALERTS.length },
  });
}
