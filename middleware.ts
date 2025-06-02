import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/app/api/supabase/middleware";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isAllowed =
    pathname === "/explore" ||
    pathname === "/learn" ||
    pathname === "/learn#features" ||
    pathname === "/tos" ||
    pathname === "/privacy-policy" ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname.startsWith("/api") ||
    pathname === "/robots.txt" ||
    pathname.startsWith("/hts-elements") || // ✅ allow access to static JSON files
    pathname.startsWith("/notes") || // ✅ allow access to PDF notes
    pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|mp4|webm|mov)$/); // ✅ allow access to image and video files

  if (!isAllowed) {
    return NextResponse.redirect(new URL("/explore", req.url));
  }

  const IS_TEST_ENV = process.env.APP_ENV === "test";
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  // If running in test env, we do not need to have a ensure
  // there is a valid user session in the cookies, so use the
  // supabase service role key instead for access to supabase
  if (IS_TEST_ENV) {
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("Authorization", `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`);
    requestHeaders.set("apiKey", SUPABASE_SERVICE_ROLE_KEY);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  return await updateSession(req);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - video files (mp4, webm, mov)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|webm|mov)$).*)",
  ],
};
