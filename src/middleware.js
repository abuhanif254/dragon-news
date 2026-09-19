import { NextResponse } from "next/server";

export function middleware(request) {
  // Check if trying to access dashboard
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    const token = request.cookies.get("admin_token")?.value;

    let isValid = false;
    if (token && token.split(".").length === 3) {
      try {
        const payloadBase64 = token.split(".")[1];
        const payloadJson = JSON.parse(atob(payloadBase64.replace(/-/g, "+").replace(/_/g, "/")));
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
      loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete("admin_token");
      return response;
    }
  }

  // Prevent logged-in admins from accessing the login page again
  if (request.nextUrl.pathname === "/login") {
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
