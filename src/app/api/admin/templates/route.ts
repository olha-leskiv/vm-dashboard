import { NextResponse } from "next/server";
import type { ApiResponse, VMTemplate } from "@/types";
import { MOCK_TEMPLATES } from "@/mocks/templates";
import { simulateDelay } from "@/lib/utils/delay";

export async function GET(): Promise<NextResponse<ApiResponse<VMTemplate[]>>> {
  await simulateDelay();
  return NextResponse.json({
    data: MOCK_TEMPLATES,
    meta: { timestamp: new Date().toISOString(), count: MOCK_TEMPLATES.length },
  });
}
