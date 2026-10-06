import type { Tool } from "@/libs/compare/types";
import * as ui from "@/components/ui/styles";

// The roundup's answer in one card: the best tool for each kind of buyer
export function QuickPicks({ picks }: { picks: { label: string; tool: Tool }[] }) {
  return (
    <aside className={`${ui.card} self-start`} aria-label="Quick picks">
      <div className={ui.cardHeader}>
        <h2 className={ui.cardTitle}>Quick picks</h2>
      </div>
      <ul className="divide-y divide-base-300">
        {picks.map(({ label, tool }) => (
          <li key={label}>
            <a
              href={`#${tool.slug}`}
              className="flex flex-col gap-0.5 px-5 py-3 transition-colors hover:bg-base-200"
            >
              <span className={ui.caption}>{label}</span>
              <span className={`text-sm font-semibold ${tool.slug === "hts-hero" ? "text-primary" : "text-base-content"}`}>
                {tool.name}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}
