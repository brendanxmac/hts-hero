import * as ui from "@/components/ui/styles";
import type { HubGroup } from "./hubCopy";

// One group of countries as a card. Long lists show their first names and fold the rest into a
// disclosure: still in the page's HTML for search engines, out of the way for readers.
const VISIBLE = 15;

export function GroupCard({ group, hrefs }: { group: HubGroup; hrefs: Record<string, string> }) {
  const link = (name: string) => (
    <a href={hrefs[name]} className="text-base-content/70 hover:text-primary hover:underline">
      {name}
      {group.details?.[name] ? <span className="text-base-content/60"> ({group.details[name]})</span> : null}
    </a>
  );
  const list = (names: string[]) => (
    <ul className="flex flex-wrap gap-x-3 gap-y-1 text-sm">
      {names.map((name) => (
        <li key={name}>{link(name)}</li>
      ))}
    </ul>
  );
  const head = group.names.slice(0, VISIBLE);
  const rest = group.names.slice(VISIBLE);

  return (
    <div id={group.id} className={`${ui.card} scroll-mt-6 flex flex-col`}>
      <div className={ui.cardHeader}>
        <h3 className={ui.cardTitle}>{group.title}</h3>
        <span className={`${ui.badge("neutral")} shrink-0 tabular-nums`}>{group.names.length}</span>
      </div>
      <div className="flex flex-col gap-3 p-5">
        <p className={ui.caption}>{group.note}</p>
        {list(head)}
        {rest.length > 0 && (
          <details className="group">
            <summary className={`${ui.link} cursor-pointer list-none text-sm [&::-webkit-details-marker]:hidden`}>
              <span className="group-open:hidden">Show all {group.names.length}</span>
              <span className="hidden group-open:inline">Show fewer</span>
            </summary>
            <div className="mt-2">{list(rest)}</div>
          </details>
        )}
      </div>
    </div>
  );
}
