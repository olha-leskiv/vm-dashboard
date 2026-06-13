import { cookies } from "next/headers";
import { MOCK_VMS } from "@/mocks/vms";
import { CURRENT_USER_ID } from "@/mocks/users";
import type { ApiResponse, VM } from "@/types";

export async function getDeveloperMachinesDirect(): Promise<ApiResponse<VM[]>> {
  const cookieStore = await cookies();
  const userId = cookieStore.get("ascendra_user_id")?.value ?? CURRENT_USER_ID;
  const machines = MOCK_VMS.filter((vm) => vm.ownerId === userId);
  return {
    data: machines,
    meta: { timestamp: new Date().toISOString(), count: machines.length },
  };
}
