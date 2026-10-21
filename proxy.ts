import { NextResponse, type NextRequest } from "next/server"
import { updateSession } from "@/app/api/supabase/middleware"
import { canonicalHtsCode } from "@/libs/hts-code"

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  const isTariffPath = pathname === "/tariffs"

  if (isTariffPath) {
    return NextResponse.redirect(new URL("/explore", req.url))
  }

  const isOldClassifyPath = pathname === "/app"

  if (isOldClassifyPath) {
    return NextResponse.redirect(new URL("/classifications", req.url))
  }

  if (pathname === "/about") {
    return NextResponse.redirect(new URL("/classify", req.url))
  }

  // The MCP server authenticates its own requests (bearer tokens, not cookies), so it skips
  // the session refresh
  if (pathname.startsWith("/api/mcp")) {
    return NextResponse.next()
  }

  // HTS code pages live at the HTS's own dotted form (/hts/7318.15.20.95); send the other forms
  // people, AI answers and other sites use (7318.15.2095, 7318152095) there permanently
  if (pathname.startsWith("/hts/")) {
    let segment = pathname.slice("/hts/".length)
    try {
      segment = decodeURIComponent(segment)
    } catch {
      // A malformed escape: leave the address to the page, which 404s
    }
    const canonical = canonicalHtsCode(segment)
    if (canonical && canonical !== segment) {
      const url = req.nextUrl.clone()
      url.pathname = `/hts/${canonical}`
      return NextResponse.redirect(url, 301)
    }
  }

  const IS_TEST_ENV = process.env.APP_ENV === "test"
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

  // Add the current pathname to headers so protected layouts can access it
  const requestHeaders = new Headers(req.headers)
  requestHeaders.set("x-pathname", pathname)

  // If running in test env, we do not need to have a ensure
  // there is a valid user session in the cookies, so use the
  // supabase service role key instead for access to supabase
  if (IS_TEST_ENV) {
    requestHeaders.set("Authorization", `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`)
    requestHeaders.set("apiKey", SUPABASE_SERVICE_ROLE_KEY)

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  const { response, user } = await updateSession(req)

  // The Tariff Tracker is for signed-in accounts only: anyone else signs in (or up) first and comes
  // back to the same page, tab and inputs. In development, ?onboardingPreview=1 opens it signed out
  // to check the import takeover (ImportTakeover)
  const onboardingPreview = process.env.NODE_ENV === "development" && req.nextUrl.searchParams.get("onboardingPreview") === "1"
  if (!user && !onboardingPreview && (pathname === "/tariff-tracker" || pathname.startsWith("/tariff-tracker/"))) {
    const url = req.nextUrl.clone()
    url.pathname = "/signin"
    url.search = ""
    url.searchParams.set("redirect", `${pathname}${req.nextUrl.search}`)
    const redirect = NextResponse.redirect(url)
    response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie))
    return redirect
  }

  // Signed-in visitors stay on the calculator (decided 2026-10-20): someone who signed up for more
  // calculator features keeps using it, and its CTAs and the onboarding emails invite them into
  // the Tracker. (It used to send them to the Tracker's Calculator tab.)

  // Ensure the x-pathname header is preserved in the response
  if (response instanceof NextResponse) {
    response.headers.set("x-pathname", pathname)
  }

  return response
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
}
