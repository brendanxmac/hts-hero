import { useWindowSize } from "./use-window-size";

// Define the type for Tailwind breakpoints
export enum TailwindBreakpoint {
  XS = "xs",
  SM = "sm",
  MD = "md",
  LG = "lg",
  XL = "xl",
}

const getBreakpoint = (width: number | undefined): TailwindBreakpoint => {
  if (width === undefined) return null; // Handle SSR case
  if (width >= 1280) return TailwindBreakpoint.XL;
  if (width >= 1024) return TailwindBreakpoint.LG;
  if (width >= 768) return TailwindBreakpoint.MD;
  if (width >= 640) return TailwindBreakpoint.SM;
  return TailwindBreakpoint.XS; // Below the smallest breakpoint
};

export function useTailwindBreakpoint(): TailwindBreakpoint {
  const { width } = useWindowSize();
  return getBreakpoint(width);
}
