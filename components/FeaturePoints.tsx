import { classNames } from "../utilities/style";
import CheckSVG from "./svg/CheckSVG";

export interface FeaturePoint {
  point: string;
  isKey?: boolean;
}

interface Props {
  points: FeaturePoint[];
}

export const FeaturePoints = ({ points }: Props) => {
  return (
    <ul className="space-y-1">
      {points.map(({ point, isKey }) => (
        <li
          key={point}
          className={classNames(
            "flex items-center gap-3",
            isKey && "text-[#40C969] font-medium pt-3",
            !isKey && "text-gray-100"
          )}
        >
          {!isKey && <CheckSVG viewBox="0 0 20 20" />}
          {point}
        </li>
      ))}
    </ul>
  );
};
