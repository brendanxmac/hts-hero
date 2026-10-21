import * as mk from "@/components/ui/marketing/styles";
import type { HubGroup } from "./hubCopy";

// One group of countries as a card. Long lists show their first names and fold the rest into a
// disclosure: still in the page's HTML for search engines, out of the way for readers.
const VISIBLE = 15;

export function GroupCard({ group }: { group: HubGroup }) {
  const label = (name: string) => (
    <>
      {name}
      {group.details?.[name] ? <span className="text-slate-400"> ({group.details[name]})</span> : null}
    </>
  );
  const list = (names: string[]) => (
    <ul className="flex flex-wrap gap-x-3 gap-y-1.5 text-sm text-slate-700">
      {names.map((name) => (
        <li key={name}>{label(name)}</li>
      ))}
    </ul>
  );
  const head = group.names.slice(0, VISIBLE);
  const rest = group.names.slice(VISIBLE);

  return (
    <div className={`${mk.card} flex min-w-0 flex-col`}>
      <div className="flex items-start justify-between gap-4 px-6 pt-6">
        <h3 className="text-lg font-semibold text-slate-900">{group.title}</h3>
        <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-0.5 text-sm font-bold tabular-nums text-slate-700">
          {group.names.length}
        </span>
      </div>
      <div className="flex flex-col gap-4 px-6 pb-6 pt-2">
        <p className={mk.small}>{group.note}</p>
        {list(head)}
        {rest.length > 0 && (
          <details className="group">
            <summary className={`${mk.link} w-fit cursor-pointer list-none text-sm [&::-webkit-details-marker]:hidden`}>
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
