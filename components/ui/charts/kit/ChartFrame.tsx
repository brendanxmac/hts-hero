"use client";

import { createContext, ReactNode, useContext, useEffect, useRef, useState } from "react";

// The box every chart draws in: as wide as its container (measured, so marks keep their stroke
// widths and text sizes instead of scaling with a viewBox), a fixed height, and margins for the
// axes. Children draw in SVG with the plot's size from useChart(); `overlay` is HTML laid over
// the plot (the tooltip). Named for screen readers; give each chart a table view as well.

export interface Margin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface ChartSize {
  width: number;
  height: number;
  margin: Margin;
  // The plot inside the margins
  innerWidth: number;
  innerHeight: number;
}

const ChartContext = createContext<ChartSize | null>(null);

export const useChart = () => {
  const size = useContext(ChartContext);
  if (!size) throw new Error("useChart must be used inside ChartFrame");
  return size;
};

export const DEFAULT_MARGIN: Margin = { top: 12, right: 12, bottom: 28, left: 44 };

export const ChartFrame = ({
  height,
  margin = DEFAULT_MARGIN,
  label,
  overlay,
  onLeave,
  children,
}: {
  height: number;
  margin?: Margin;
  // What the chart shows, for screen readers
  label: string;
  overlay?: (size: ChartSize) => ReactNode;
  onLeave?: () => void;
  children: (size: ChartSize) => ReactNode;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    if (!ref.current) return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.floor(entry.contentRect.width)));
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  const size: ChartSize = {
    width,
    height,
    margin,
    innerWidth: Math.max(0, width - margin.left - margin.right),
    innerHeight: Math.max(0, height - margin.top - margin.bottom),
  };
  return (
    <div ref={ref} className="relative w-full" style={{ height }} onMouseLeave={onLeave}>
      {width > 0 && (
        <ChartContext.Provider value={size}>
          <svg width={width} height={height} role="img" aria-label={label} className="block overflow-visible">
            <g transform={`translate(${margin.left},${margin.top})`}>{children(size)}</g>
          </svg>
          {overlay?.(size)}
        </ChartContext.Provider>
      )}
    </div>
  );
};
