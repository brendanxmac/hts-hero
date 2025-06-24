import SVG, { SVGProps } from "./SVG";

export default function UpTrendSVG({ color, size, viewBox }: SVGProps) {
  return (
    <SVG
      color={color}
      size={size}
      viewBox={viewBox}
      path={
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941"
        />
      }
    />
  );
}
