import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/app/api/supabase/middleware";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isTariffPath = pathname === "/tariffs";

  if (isTariffPath) {
    return NextResponse.redirect(new URL("/explore", req.url));
  }

  const isOldClassifyPath = pathname === "/app";

  if (isOldClassifyPath) {
    return NextResponse.redirect(new URL("/classifications", req.url));
  }

  // Redirect /explore?code=X to /hts/X for SEO canonical URLs
  if (pathname === "/explore" && req.nextUrl.searchParams.has("code")) {
    const code = req.nextUrl.searchParams.get("code")!.trim();
    if (code) {
      return NextResponse.redirect(new URL(`/hts/${code}`, req.url), 301);
    }
  }

  // Rewrite /duty-calculator/[code] to /duty-calculator?code=[code]
  // Keeps the clean URL in the browser while serving the calculator page
  if (pathname.startsWith("/duty-calculator/") && pathname !== "/duty-calculator/") {
    const code = pathname.replace("/duty-calculator/", "");
    if (code) {
      const newUrl = new URL("/duty-calculator", req.url);
      newUrl.searchParams.set("code", code);
      req.nextUrl.searchParams.forEach((value, key) => {
        newUrl.searchParams.set(key, value);
      });
      return NextResponse.rewrite(newUrl);
    }
  }

  const IS_TEST_ENV = process.env.APP_ENV === "test";
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  // Add the current pathname to headers so protected layouts can access it
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", pathname);

  // If running in test env, we do not need to have a ensure
  // there is a valid user session in the cookies, so use the
  // supabase service role key instead for access to supabase
  if (IS_TEST_ENV) {
    requestHeaders.set("Authorization", `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`);
    requestHeaders.set("apiKey", SUPABASE_SERVICE_ROLE_KEY);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  const response = await updateSession(req);

  // Ensure the x-pathname header is preserved in the response
  if (response instanceof NextResponse) {
    response.headers.set("x-pathname", pathname);
  }

  return response;
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
