import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { FileUploadDownloadResponse } from "../../../libs/supabase/storage";

export const createClient = () => {
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
};

// Create an admin client with service role key for storage operations
export const createAdminClient = () => {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
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

export const getSignedUrl = async (
  bucket: string,
  path: string
): Promise<FileUploadDownloadResponse> => {
  // Remove leading slash if present to match Supabase storage path format
  let cleanPath = path.startsWith("/") ? path.slice(1) : path;

  // Remove bucket name from path if it's included (e.g., "notes/chapter/file.pdf" -> "chapter/file.pdf")
  if (cleanPath.startsWith(`${bucket}/`)) {
    cleanPath = cleanPath.slice(bucket.length + 1);
  }

  console.log("BUCKET", bucket);
  console.log("PATH", path);
  console.log("CLEAN PATH", cleanPath);

  // Use admin client with service role key for storage operations
  const supabase = createAdminClient();
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(cleanPath, 60 * 60 * 1); // valid for 1 hour

  if (error) {
    console.error("Failed to create signed URL:", error);
    console.error("Error details:", {
      message: error.message,
      name: error.name,
    });
  }

  return { signedUrl: data?.signedUrl, error: error?.message };
};
