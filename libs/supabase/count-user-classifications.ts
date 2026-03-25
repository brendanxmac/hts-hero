import { createSupabaseClient } from "./client";

/** Rows owned by this user (their creations), for free-tier limits — not team-wide list length. */
export async function countClassificationsForUserId(
  userId: string,
): Promise<number> {
  const supabase = createSupabaseClient();
  const { count, error } = await supabase
    .from("classifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  if (error) {
    console.error("Failed to count classifications for user:", error);
    return 0;
  }

  return count ?? 0;
}
