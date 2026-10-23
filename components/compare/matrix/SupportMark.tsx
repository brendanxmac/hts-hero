import {
  CheckCircleIcon,
  LockClosedIcon,
  MinusCircleIcon,
  MinusIcon,
  XMarkIcon,
} from "@heroicons/react/20/solid";
import { SUPPORT_LABELS } from "@/libs/compare/features";
import type { FeatureValue, Support } from "@/libs/compare/types";
import * as ui from "@/components/ui/styles";
import { formatPostDate } from "@/components/blog/lib/format";

const MARKS: Record<Support, { Icon: typeof CheckCircleIcon; color: string }> = {
  yes: { Icon: CheckCircleIcon, color: "text-success" },
  paid: { Icon: CheckCircleIcon, color: "text-primary" },
  partial: { Icon: MinusCircleIcon, color: "text-warning" },
  gated: { Icon: LockClosedIcon, color: "text-warning" },
  onRequest: { Icon: CheckCircleIcon, color: "text-primary" },
  no: { Icon: XMarkIcon, color: "text-base-content/60" },
  unknown: { Icon: MinusIcon, color: "text-base-content/60" },
};

const evidenceLink = "underline decoration-base-content/20 underline-offset-2 hover:text-primary";

// "flexport.com/pricing": a searched page, short enough for a table cell
const shortUrl = (url: string) => {
  const { hostname, pathname } = new URL(url);
  return `${hostname.replace(/^www\./, "")}${pathname === "/" ? "" : pathname.replace(/\/$/, "")}`;
};

// One cell of a comparison table: an icon and a word, the note that qualifies it, then the
// vendor page that shows it (or, for "Not found", the pages searched) and when it was checked
export function SupportMark({ value }: { value: FeatureValue }) {
  const { Icon, color } = MARKS[value.support];
  const quiet = value.support === "no" || value.support === "unknown";
  return (
    <div className="flex flex-col gap-0.5">
      <span className={`flex items-center gap-1.5 font-medium ${quiet ? "text-base-content/60" : "text-base-content"}`}>
        <Icon className={`h-4 w-4 shrink-0 ${color}`} aria-hidden />
        {SUPPORT_LABELS[value.support]}
      </span>
      {value.note && <span className={ui.caption}>{value.note}</span>}
      {value.evidence && (
        <span className={ui.caption}>
          <a href={value.evidence.url} target="_blank" rel="noopener noreferrer nofollow" className={evidenceLink}>
            Source
          </a>
          , checked <time dateTime={value.evidence.checkedAt}>{formatPostDate(value.evidence.checkedAt, "short")}</time>
        </span>
      )}
      {value.searched && (
        <details className={ui.caption}>
          <summary className="cursor-pointer">
            Searched {value.searched.urls.length} page{value.searched.urls.length === 1 ? "" : "s"},{" "}
            <time dateTime={value.searched.checkedAt}>{formatPostDate(value.searched.checkedAt, "short")}</time>
          </summary>
          <ul className="mt-1 flex flex-col gap-0.5">
            {value.searched.urls.map((url) => (
              <li key={url} className="break-all">
                <a href={url} target="_blank" rel="noopener noreferrer nofollow" className={evidenceLink}>
                  {shortUrl(url)}
                </a>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
