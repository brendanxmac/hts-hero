import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/libs/supabase/middleware";

export async function middleware(request: NextRequest) {
  console.log(`Here in middleware`);
  const host = request.headers.get("host");

  if (host === "app.htshero.com") {
    console.log(`host is app.htshero.com`);
    // Redirect to the app-specific route
    return NextResponse.rewrite(new URL("/app", request.url));
  }

  console.log(`host is not app.htshero.com`);

  return await updateSession(request);
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
