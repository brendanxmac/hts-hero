import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/app/api/supabase/middleware";

export async function middleware(req: NextRequest) {
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
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
