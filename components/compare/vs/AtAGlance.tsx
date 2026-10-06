import type { Tool } from "@/libs/compare/types";
import * as ui from "@/components/ui/styles";

// Both tools' price and audience, side by side in the hero's right column
export function AtAGlance({ ours, theirs }: { ours: Tool; theirs: Tool }) {
  const rows = [
    { label: "Starting price", get: (t: Tool) => t.price },
    { label: "Best for", get: (t: Tool) => t.bestFor },
    { label: "What it is", get: (t: Tool) => t.kind },
  ];
  return (
    <aside className={`${ui.card} self-start`} aria-label="At a glance">
      <div className={ui.cardHeader}>
        <h2 className={ui.cardTitle}>At a glance</h2>
      </div>
      <dl className="divide-y divide-base-300">
        {rows.map((row) => (
          <div key={row.label} className="flex flex-col gap-2 px-5 py-3">
            <dt className={ui.label}>{row.label}</dt>
            <dd className="grid grid-cols-2 gap-4 text-sm">
              {[ours, theirs].map((tool) => (
                <div key={tool.slug} className="flex flex-col gap-0.5">
                  <span className="text-xs font-semibold text-base-content/60">{tool.name}</span>
                  <span className={tool === ours ? "font-medium text-base-content" : "text-base-content/70"}>
                    {row.get(tool)}
                  </span>
                </div>
              ))}
            </dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}
