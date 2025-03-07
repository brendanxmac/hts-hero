import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}

export async function requesterIsAuthenticated(req: NextRequest) {
  // Service Role Key is a high privledge key that allows supabase access
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  // Extract Authorization header
  const authHeader = req.headers.get("authorization");
  const authToken = authHeader?.split(" ")[1]; // Extract token from "Bearer <token>"
  const requestHasValidServiceKey =
    SUPABASE_SERVICE_ROLE_KEY !== undefined &&
    authToken === SUPABASE_SERVICE_ROLE_KEY;

  if (requestHasValidServiceKey) return true;

  console.log(`Checking user token`);

  // If no service role key, check that the request came from a valid user via cookies

  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  return Boolean(user);
}
