import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { FileUploadDownloadResponse } from "../../../libs/supabase/storage";
import { getAnonymousTokenFromCookieHeader } from "../../../libs/anonymous-token";

export const createClient = () =>
  createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async getAll() {
          return (await cookies()).getAll();
        },
        async setAll(cookiesToSet) {
          try {
            const cookieStore = await cookies();
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

// A client for public data with no user session, so pages that read it can stay static
// (cookies() would make them dynamic). Row-level security limits it to what anyone may read.
export const createPublicClient = () =>
  createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll(): { name: string; value: string }[] {
        return [];
      },
      setAll() {},
    },
  });

// Create an admin client with service role key for storage operations
export const createAdminClient = () => {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll(): { name: string; value: string }[] {
          return [];
        },
        setAll() {
          // No-op for admin client
        },
      },
    }
  );
};

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

  // If no service role key, check that the request came from a valid user via cookies

  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  return Boolean(user);
}

/**
 * Allows access if the requester is either authenticated OR has an anonymous
 * token tied to at least one existing classification in the database.
 */
export async function requesterIsAuthenticatedOrAnonymous(req: NextRequest) {
  const isAuthenticated = await requesterIsAuthenticated(req);
  if (isAuthenticated) return true;

  const anonToken = getAnonymousTokenFromCookieHeader(
    req.headers.get("cookie")
  );
  if (!anonToken) return false;

  const supabase = createClient();
  const { count } = await supabase
    .from("classifications")
    .select("id", { count: "exact", head: true })
    .eq("anonymous_token", anonToken)
    .is("user_id", null);

  return (count ?? 0) > 0;
}

export const getSignedUrl = async (
  bucket: string,
  path: string,
  expirySeconds: number = 60 * 60 * 1
): Promise<FileUploadDownloadResponse> => {
  // Remove leading slash if present to match Supabase storage path format
  let cleanPath = path.startsWith("/") ? path.slice(1) : path;

  // Remove bucket name from path if it's included (e.g., "notes/chapter/file.pdf" -> "chapter/file.pdf")
  if (cleanPath.startsWith(`${bucket}/`)) {
    cleanPath = cleanPath.slice(bucket.length + 1);
  }

  // Use admin client with service role key for storage operations
  const supabase = createAdminClient();
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(cleanPath, expirySeconds);

  if (error) {
    console.error("Failed to create signed URL:", error);
    console.error("Error details:", {
      message: error.message,
      name: error.name,
    });
  }

  return { signedUrl: data?.signedUrl, error: error?.message };
};
