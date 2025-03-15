import { classNames } from "../utilities/style";
import CheckSVG from "./svg/CheckSVG";

export interface FeaturePoint {
  point: string;
  detail?: string;
  isKey?: boolean;
}

interface Props {
  points: FeaturePoint[];
}

export const FeaturePoints = ({ points }: Props) => {
  return (
    <ul className="space-y-4">
      {points.map(({ point, detail, isKey }) => (
        <li
          key={point}
          className={classNames(
            "flex items-start gap-3",
            isKey && "text-[#40C969] font-medium pt-3",
            !isKey && "text-gray-100"
          )}
        >
          {!isKey && <CheckSVG viewBox="0 0 20 20" />}
          <div className="flex flex-col gap-1 -mt-1">
            <span>{point}</span>
            {detail && <span className="text-xs text-gray-400">{detail}</span>}
          </div>
        </li>
      ))}
    </ul>
  );
};
