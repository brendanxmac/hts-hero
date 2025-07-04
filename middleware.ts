import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/app/api/supabase/middleware";
import { createClient } from "./app/api/supabase/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  if (user && pathname === "/") {
    return NextResponse.redirect(new URL("/app", req.url));
  }

  const isRedirectPath =
    pathname === "/blog" ||
    pathname === "/" ||
    pathname.includes("/about/importer") ||
    pathname.includes("/about/partner") ||
    pathname.includes("/about/classifier");

  if (isRedirectPath) {
    return NextResponse.redirect(new URL("/about", req.url));
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
