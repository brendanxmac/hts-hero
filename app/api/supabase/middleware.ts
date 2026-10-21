import { createServerClient } from "@supabase/ssr";
import { User } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

// Refreshes the visitor's auth session, and says who they are (null when signed out)
export async function updateSession(request: NextRequest): Promise<{ response: NextResponse; user: User | null }> {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const IS_TEST_ENV = process.env.APP_ENV === "test";

  // If running in test env, we do not need to have a ensure
  // there is a valid user session in the cookies, so skip
  if (IS_TEST_ENV) return { response: supabaseResponse, user: null };

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
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response: supabaseResponse, user };
}
