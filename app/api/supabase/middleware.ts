import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  console.log(`111111`, process.env.APP_ENV);
  const IS_TEST_ENV = process.env.APP_ENV === "test";
  console.log(`27598327589237452798`, IS_TEST_ENV);

  // If running in test env, we do not need to have a ensure
  // there is a valid user session in the cookies, so skip
  if (IS_TEST_ENV) return supabaseResponse;

  // // Extract Authorization header
  // const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  // console.log("SUPABASE_SERVICE_ROLE_KEY", SUPABASE_SERVICE_ROLE_KEY);
  // const authHeader = request.headers.get("authorization");
  // console.log("authHeader", authHeader);
  // const authToken = authHeader?.split(" ")[1]; // Extract token from "Bearer <token>"
  // console.log("authToken", authToken);
  // const requestHasValidServiceKey = authToken === SUPABASE_SERVICE_ROLE_KEY;

  // console.log(`Request has valid service key: ${requestHasValidServiceKey}`);
  // if (requestHasValidServiceKey) return supabaseResponse;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // refreshing the auth token
  await supabase.auth.getUser();

  return supabaseResponse;
}
