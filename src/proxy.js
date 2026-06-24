import { NextResponse } from "next/server";

export function proxy(request) {
  // Check if trying to access dashboard
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    const token = request.cookies.get("admin_token")?.value;

    if (!token) {
      // Redirect unauthenticated users to login
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Prevent logged-in admins from accessing the login page again
  if (request.nextUrl.pathname === "/login") {
    const token = request.cookies.get("admin_token")?.value;
    if (token) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
