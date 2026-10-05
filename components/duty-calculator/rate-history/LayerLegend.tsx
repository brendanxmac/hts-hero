"use client";

import { Layer } from "./types";

// The chart's legend. Hovering a layer highlights it here, in the donut and in the statement.
export const LayerLegend = ({
  layers,
  highlight,
  onHighlight,
}: {
  layers: Layer[];
  highlight?: string | null;
  onHighlight?: (label: string | null) => void;
}) => (
  <ul className="flex flex-wrap gap-x-3 gap-y-1.5 -mt-1">
    {layers.map((layer) => (
      <li
        key={layer.label}
        className={`flex items-center gap-1.5 text-xs text-base-content/70 cursor-default transition-opacity ${
          highlight && highlight !== layer.label ? "opacity-40" : ""
        }`}
        onMouseEnter={() => onHighlight?.(layer.label)}
        onMouseLeave={() => onHighlight?.(null)}
      >
        <span
          className="h-2.5 w-2.5 rounded shrink-0"
          style={{ background: layer.color }}
          aria-hidden
        />
        {layer.label}
      </li>
    ))}
  </ul>
);
