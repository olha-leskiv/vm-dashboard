import { cookies } from "next/headers";
import { MOCK_USERS } from "@/mocks/users";
import type { User } from "@/types";

export async function getAuthRole(): Promise<"engineer" | "admin" | null> {
  const cookieStore = await cookies();
  const role = cookieStore.get("ascendra_role")?.value;
  if (role === "engineer" || role === "admin") return role;
  return null;
}

export async function getAuthUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("ascendra_user_id")?.value ?? null;
}

export async function getAuthUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const userId = cookieStore.get("ascendra_user_id")?.value;
  const role = cookieStore.get("ascendra_role")?.value as "engineer" | "admin" | undefined;
  if (!userId || !role) return null;
  const user = MOCK_USERS.find((u) => u.id === userId);
  if (!user) return null;
  return { ...user, role };
}
