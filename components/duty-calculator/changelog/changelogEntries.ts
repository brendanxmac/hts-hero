import { ChangelogEntry, ChangelogEntryInput } from "@/libs/supabase/tariff-changelog";

// The changelog editor's data: a blank entry, the list's order, and calls to the API.

const today = () => new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD, local time

export const emptyDraft = (): ChangelogEntryInput => ({
  entry_date: today(),
  type: "fix",
  title: "",
  summary: "",
  revision: null,
  status: "published",
});

export const sortEntries = (entries: ChangelogEntry[]) =>
  [...entries].sort(
    (a, b) => b.entry_date.localeCompare(a.entry_date) || b.created_at.localeCompare(a.created_at),
  );

export const request = async (method: "POST" | "PATCH" | "DELETE", body?: object, id?: string) => {
  const res = await fetch(`/api/tariff-changelog${id ? `?id=${encodeURIComponent(id)}` : ""}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error ?? "Something went wrong.");
  return json as { entry?: ChangelogEntry };
};
