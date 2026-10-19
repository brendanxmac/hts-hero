// The key, above or beside the chart: always there for two or more series (never color alone),
// in text tokens with a swatch beside each name
export const Legend = ({ items }: { items: { label: string; color: string; shape?: "square" | "line" | "dot" }[] }) => (
  <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-base-content/70">
    {items.map((item) => (
      <span key={item.label} className="inline-flex items-center gap-1.5">
        <span
          className={item.shape === "line" ? "h-0.5 w-4 rounded-sm" : item.shape === "dot" ? "h-2.5 w-2.5 rounded-full" : "h-2.5 w-2.5 rounded-xs"}
          // Series color (DESIGN_SYSTEM §10)
          style={{ background: item.color }}
          aria-hidden
        />
        {item.label}
      </span>
    ))}
  </div>
);
