import { NextResponse } from "next/server";
import { auth } from "@/auth";

export default auth((request) => {
  const { pathname } = request.nextUrl;
  const isAdminPage = pathname.startsWith("/admin");
  const isAdminsApi = pathname.startsWith("/api/admins");
  const isMutatingApi =
    (pathname.startsWith("/api/sections") ||
      pathname.startsWith("/api/topics") ||
      isAdminsApi) &&
    request.method !== "GET" &&
    request.method !== "HEAD";
  const needsAuth =
    isAdminPage ||
    isMutatingApi ||
    (isAdminsApi && request.method === "GET");

  if (!needsAuth) {
    return NextResponse.next();
  }

  if (!request.auth) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const login = new URL("/login", request.nextUrl.origin);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/admin",
    "/admin/:path*",
    "/api/sections",
    "/api/sections/:path*",
    "/api/topics",
    "/api/topics/:path*",
    "/api/admins",
    "/api/admins/:path*",
  ],
};
