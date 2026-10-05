import { ChangelogEntry, formatChangelogDate } from "@/libs/supabase/tariff-changelog";
import * as ui from "@/components/ui/styles";
import { ChangelogTypeBadge } from "./ChangelogTypeBadge";

// One entry in the full changelog, with the admin's controls under it. Rendered by
// ChangelogList, which owns the state the controls change.
export const ChangelogArticle = ({
  entry,
  isAdmin,
  onEdit,
  onSetStatus,
  onDelete,
}: {
  entry: ChangelogEntry;
  isAdmin: boolean;
  onEdit: () => void;
  onSetStatus: (status: ChangelogEntry["status"]) => void;
  onDelete: () => void;
}) => (
  <article>
    <div className="flex flex-wrap items-center gap-2 text-sm text-base-content/60">
      <time dateTime={entry.entry_date}>{formatChangelogDate(entry.entry_date)}</time>
      <ChangelogTypeBadge type={entry.type} />
      {entry.status === "draft" && <span className={ui.badge("warning")}>Draft</span>}
    </div>
    <h2 className="mt-2 text-lg font-semibold leading-snug text-base-content">{entry.title}</h2>
    <p className={`${ui.body} mt-1.5`}>{entry.summary}</p>
    {isAdmin && (
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" className={ui.button({ size: "sm" })} onClick={onEdit}>
          Edit
        </button>
        {entry.status === "draft" ? (
          <button type="button" className={ui.button({ variant: "primary", size: "sm" })} onClick={() => onSetStatus("published")}>
            Publish
          </button>
        ) : (
          <button type="button" className={ui.button({ size: "sm" })} onClick={() => onSetStatus("draft")}>
            Unpublish
          </button>
        )}
        <button type="button" className={ui.button({ size: "sm" })} onClick={onDelete}>
          Delete
        </button>
      </div>
    )}
  </article>
);
