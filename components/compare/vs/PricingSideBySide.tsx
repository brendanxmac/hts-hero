import type { Tool } from "@/libs/compare/types";
import * as ui from "@/components/ui/styles";

// Each tool's pricing in its own words, next to each other
export function PricingSideBySide({ tools }: { tools: Tool[] }) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {tools.map((tool) => (
        <div key={tool.slug} className={`${ui.card} flex flex-col gap-2 p-5`}>
          <span className={ui.label}>{tool.name}</span>
          <p className={ui.metric.secondaryCompact}>{tool.price}</p>
          <p className={ui.bodySm}>{tool.priceDetail}</p>
        </div>
      ))}
    </div>
  );
}
