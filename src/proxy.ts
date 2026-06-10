import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const role = request.cookies.get("ascendra_role")?.value as "engineer" | "admin" | undefined;

  // Authenticated users get redirected away from sign-in
  if (pathname === "/sign-in") {
    if (role === "engineer") {
      return NextResponse.redirect(new URL("/developer/machines", request.url));
    }
    if (role === "admin") {
      return NextResponse.redirect(new URL("/admin/overview", request.url));
    }
    return NextResponse.next();
  }

  // Root page handles its own redirect via getAuthRole()
  if (pathname === "/") return NextResponse.next();

  // Unauthenticated — send to sign-in
  if (!role) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // Wrong-role access — redirect to own home
  if (pathname.startsWith("/developer") && role !== "engineer") {
    return NextResponse.redirect(new URL("/admin/overview", request.url));
  }
  if (pathname.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL("/developer/machines", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
