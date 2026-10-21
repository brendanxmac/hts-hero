import { ChangelogEntry, formatChangelogDate } from "@/libs/supabase/tariff-changelog";
import * as mk from "@/components/ui/marketing/styles";
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
    <div className="flex flex-wrap items-center gap-2 text-sm font-medium tabular-nums text-slate-500">
      <time dateTime={entry.entry_date}>{formatChangelogDate(entry.entry_date)}</time>
      <ChangelogTypeBadge type={entry.type} />
      {entry.status === "draft" && <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-800 ring-1 ring-inset ring-amber-200">Draft</span>}
    </div>
    <h2 className="mt-3 text-xl font-semibold leading-snug tracking-tight text-slate-900 sm:text-2xl sm:leading-8">{entry.title}</h2>
    <p className={`${mk.body} mt-2`}>{entry.summary}</p>
    {isAdmin && (
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" className={`${mk.buttonSecondary} h-9 px-4 text-sm`} onClick={onEdit}>
          Edit
        </button>
        {entry.status === "draft" ? (
          <button type="button" className={`${mk.buttonPrimary} h-9 px-4 text-sm`} onClick={() => onSetStatus("published")}>
            Publish
          </button>
        ) : (
          <button type="button" className={`${mk.buttonSecondary} h-9 px-4 text-sm`} onClick={() => onSetStatus("draft")}>
            Unpublish
          </button>
        )}
        <button type="button" className={`${mk.buttonSecondary} h-9 px-4 text-sm`} onClick={onDelete}>
          Delete
        </button>
      </div>
    )}
  </article>
);
