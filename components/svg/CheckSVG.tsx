import SVG, { SVGProps } from "./SVG";

export default function CheckSVG({ color, size, viewBox }: SVGProps) {
  return (
    <SVG
      size={size}
      color={color}
      viewBox={viewBox}
      path={
        <path
          fillRule="evenodd"
          d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
          clipRule="evenodd"
        />
      }
    />
  );
}
