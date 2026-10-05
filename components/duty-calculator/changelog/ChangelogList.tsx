"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChangelogEntry, ChangelogEntryInput } from "@/libs/supabase/tariff-changelog";
import * as ui from "@/components/ui/styles";
import { ChangelogArticle } from "./ChangelogArticle";
import { ChangelogEntryForm } from "./ChangelogEntryForm";
import { emptyDraft, request, sortEntries } from "./changelogEntries";

// The full changelog. The admin can add, edit, publish and delete entries.
export const ChangelogList = ({
  initialEntries,
  isAdmin,
}: {
  initialEntries: ChangelogEntry[];
  isAdmin: boolean;
}) => {
  const router = useRouter();
  const [entries, setEntries] = useState(initialEntries);
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const replace = (entry: ChangelogEntry) =>
    setEntries((current) => sortEntries([...current.filter((e) => e.id !== entry.id), entry]));

  const run = async (action: () => Promise<void>) => {
    setError(null);
    try {
      await action();
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    }
  };

  const save = (input: ChangelogEntryInput, id?: string) =>
    run(async () => {
      const { entry } = id ? await request("PATCH", { ...input, id }) : await request("POST", input);
      replace(entry);
      setEditing(null);
    });

  const setStatus = (entry: ChangelogEntry, status: ChangelogEntry["status"]) =>
    run(async () => replace((await request("PATCH", { id: entry.id, status })).entry));

  const remove = (entry: ChangelogEntry) => {
    if (!window.confirm(`Delete "${entry.title}"? This can't be undone.`)) return;
    run(async () => {
      await request("DELETE", undefined, entry.id);
      setEntries((current) => current.filter((e) => e.id !== entry.id));
    });
  };

  return (
    <div className="mt-10">
      {isAdmin && (
        <div className="mb-6 flex items-center justify-between gap-3">
          <p className="text-sm text-base-content/60">
            Admin: drafts are only visible to you.
          </p>
          {editing !== "new" && (
            <button type="button" className={ui.button({ variant: "primary", size: "sm" })} onClick={() => setEditing("new")}>
              Add entry
            </button>
          )}
        </div>
      )}
      {error && (
        <p role="alert" className={`${ui.notice("error")} mb-4 text-sm text-base-content`}>
          {error}
        </p>
      )}
      {editing === "new" && (
        <ChangelogEntryForm initial={emptyDraft()} onCancel={() => setEditing(null)} onSave={(input) => save(input)} />
      )}

      {entries.length === 0 ? (
        <p className={`${ui.card} px-5 py-8 text-center text-sm text-base-content/60`}>
          No updates yet.
        </p>
      ) : (
        <ol className="relative border-l border-base-300 ml-1.5">
          {entries.map((entry) => (
            <li key={entry.id} className="relative pl-6 pb-8 last:pb-0">
              <span
                className="absolute -left-1.5 top-1.5 h-2.5 w-2.5 rounded-full border-2 border-base-200 bg-primary"
                aria-hidden
              />
              {editing === entry.id ? (
                <ChangelogEntryForm
                  initial={entry}
                  onCancel={() => setEditing(null)}
                  onSave={(input) => save(input, entry.id)}
                />
              ) : (
                <ChangelogArticle
                  entry={entry}
                  isAdmin={isAdmin}
                  onEdit={() => setEditing(entry.id)}
                  onSetStatus={(status) => setStatus(entry, status)}
                  onDelete={() => remove(entry)}
                />
              )}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
};
