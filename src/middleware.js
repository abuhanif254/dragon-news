import { NextResponse } from "next/server";

const ADMIN_EMAIL = (
  process.env.NEXT_PUBLIC_ADMIN_EMAIL ||
  process.env.ADMIN_EMAIL ||
  "mohammadbitullah@gmail.com"
).toLowerCase();

const ADMIN_ONLY_PREFIXES = [
  "/dashboard/settings",
  "/dashboard/users",
  "/dashboard/categories",
  "/dashboard/pages",
  "/dashboard/messages",
  "/dashboard/subscribers",
];

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // 1. Gating for all dashboard routes
  if (pathname.startsWith("/dashboard")) {
    const token = request.cookies.get("admin_token")?.value;

    let isValid = false;
    let payloadJson = null;

    if (token && token.split(".").length === 3) {
      try {
        const payloadBase64 = token.split(".")[1];
        payloadJson = JSON.parse(atob(payloadBase64.replace(/-/g, "+").replace(/_/g, "/")));
        if (payloadJson.exp && payloadJson.exp > Math.floor(Date.now() / 1000)) {
          isValid = true;
        }
      } catch (e) {
        isValid = false;
      }
    }

    if (!isValid) {
      // Redirect unauthenticated or expired users to login and clear bad cookie
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete("admin_token");
      return response;
    }

    // 2. Strict Role Gating: Protect admin-only subpaths
    const isAdminRoute = ADMIN_ONLY_PREFIXES.some((prefix) => pathname.startsWith(prefix));
    if (isAdminRoute) {
      const userEmail = (payloadJson?.email || "").toLowerCase();
      if (userEmail !== ADMIN_EMAIL) {
        // Non-admin token attempting to access admin configuration or user management
        const accessDeniedUrl = new URL("/dashboard", request.url);
        accessDeniedUrl.searchParams.set("unauthorized", "1");
        return NextResponse.redirect(accessDeniedUrl);
      }
    }
  }

  // 3. Prevent logged-in users from accessing the login page again
  if (pathname === "/login") {
    const token = request.cookies.get("admin_token")?.value;
    if (token && token.split(".").length === 3) {
      try {
        const payloadBase64 = token.split(".")[1];
        const payloadJson = JSON.parse(atob(payloadBase64.replace(/-/g, "+").replace(/_/g, "/")));
        if (payloadJson.exp && payloadJson.exp > Math.floor(Date.now() / 1000)) {
          return NextResponse.redirect(new URL("/dashboard", request.url));
        }
      } catch (e) {}
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
