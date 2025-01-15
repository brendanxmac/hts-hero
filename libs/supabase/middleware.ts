import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(
  request: NextRequest,
  response: NextResponse
) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          console.log("GET ALL");
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          console.log("SET ALL");
          cookiesToSet.forEach(({ name, value }) => {
            console.log("yipee");
            console.log(name);
            request.cookies.set(name, value);
          });
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            console.log("lol");
            console.log(name);
            response.cookies.set(name, value, {
              ...options,
              sameSite: "lax",
              secure: process.env.NODE_ENV === "production",
              domain: ".htshero.com",
            });
          });
        },
      },
    }
  );

  // refreshing the auth token
  await supabase.auth.getUser();

  console.log(`Response Cookies: `);
  console.log(response.cookies.getAll());

  return response;
}
