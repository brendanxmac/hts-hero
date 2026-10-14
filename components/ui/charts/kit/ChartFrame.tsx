"use client";

import { createContext, ReactNode, useContext, useEffect, useRef, useState } from "react";

// The box every chart draws in: as wide as its container (measured, so marks keep their stroke
// widths and text sizes instead of scaling with a viewBox), a fixed height, and margins for the
// axes. Children draw in SVG with the plot's size from useChart(); `overlay` is HTML laid over
// the plot (the tooltip). Named for screen readers; give each chart a table view as well.
//
// Before it's measured (on the server, and until the page's script runs) nothing is drawn,
// unless the host gives an `initialWidth`: then the chart is drawn at that width and scaled to fit
// (a viewBox), so server-rendered pages (marketing, SEO) show it straight away and to crawlers,
// and it redraws at its real width once measured.

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
  initialWidth,
  children,
}: {
  height: number;
  // Draw at this width (scaled to fit) until the real width is measured: for server rendering
  initialWidth?: number;
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
  // Measured, or the host's starting width until it is
  const drawn = width || initialWidth || 0;
  const scaled = !width && Boolean(initialWidth);
  const size: ChartSize = {
    width: drawn,
    height,
    margin,
    innerWidth: Math.max(0, drawn - margin.left - margin.right),
    innerHeight: Math.max(0, height - margin.top - margin.bottom),
  };
  return (
    <div ref={ref} className="relative w-full" style={{ height }} onMouseLeave={onLeave}>
      {drawn > 0 && (
        <ChartContext.Provider value={size}>
          <svg
            width={scaled ? "100%" : drawn}
            height={height}
            viewBox={scaled ? `0 0 ${drawn} ${height}` : undefined}
            preserveAspectRatio={scaled ? "xMinYMid meet" : undefined}
            role="img"
            aria-label={label}
            className="block overflow-visible"
          >
            <g transform={`translate(${margin.left},${margin.top})`}>{children(size)}</g>
          </svg>
          {!scaled && overlay?.(size)}
        </ChartContext.Provider>
      )}
    </div>
  );
};
