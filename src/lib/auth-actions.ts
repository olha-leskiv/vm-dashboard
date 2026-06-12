"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const ROLE_USERS: Record<"engineer" | "admin", string> = {
  admin: "usr-001",    // Alice Chen — role: "admin" in MOCK_USERS (i=0, 0%14===0)
  engineer: "usr-003", // Carlos Singh — role: "engineer" in MOCK_USERS (i=2)
};

export async function signIn(role: "engineer" | "admin") {
  const cookieStore = await cookies();
  cookieStore.set("ascendra_role", role, { httpOnly: true, path: "/", sameSite: "lax" });
  cookieStore.set("ascendra_user_id", ROLE_USERS[role], {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
  });
  redirect(role === "engineer" ? "/developer/machines" : "/admin/overview");
}

export async function signOut() {
  const cookieStore = await cookies();
  cookieStore.delete("ascendra_role");
  cookieStore.delete("ascendra_user_id");
  redirect("/sign-in");
}
