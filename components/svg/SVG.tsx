import type { JSX } from "react";

export type DaisyUIColor =
  | "primary"
  | "secondary"
  | "accent"
  | "neutral"
  | "base-100"
  | "base-200"
  | "base-300"
  | "info"
  | "success"
  | "warning"
  | "error";

export interface SVGBaseProps extends SVGProps {
  path: JSX.Element;
}

export interface SVGProps {
  color?: DaisyUIColor;
  size?: number;
  viewBox: string;
  fill?: boolean;
}

export default function SVG({
  color = "primary",
  size,
  path,
  viewBox,
  fill = false,
}: SVGBaseProps) {
  const colorClass = `text-${color}`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={viewBox}
      fill={fill ? "currentColor" : "none"}
      strokeWidth={fill ? "0" : "1.5"}
      stroke={fill ? "none" : "currentColor"}
      className={`h-${size || 5} w-${size || 5} inline shrink-0 ${colorClass}`}
    >
      {path}
    </svg>
  );
}
