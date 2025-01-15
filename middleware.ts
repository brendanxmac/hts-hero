import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/libs/supabase/middleware";

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const host = request.headers.get("host");

  // FIXME: I think this should add the cookies no matter what we do...

  // Check if the host is `app.htshero.com`
  if (host === "app.htshero.com") {
    // Rewrite to the `/app` route
    url.pathname = `/app${url.pathname}`;
    const response = await updateSession(request, NextResponse.rewrite(url));

    return response;
  }

  return await updateSession(
    request,
    NextResponse.next({
      request,
    })
  );
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
