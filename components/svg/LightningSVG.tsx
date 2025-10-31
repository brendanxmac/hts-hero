import SVG, { SVGProps } from "./SVG";

export default function LightningSVG({
  color,
  size,
  viewBox,
  fill = false,
}: SVGProps) {
  return (
    <SVG
      fill={fill}
      color={color}
      size={size}
      viewBox={viewBox}
      path={
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z"
        />
      }
    />
  );
}
