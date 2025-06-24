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
            isKey && "text-secondary font-medium pt-3",
            !isKey && "text-gray-100"
          )}
        >
          {!isKey && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m4.5 12.75 6 6 9-13.5"
              />
            </svg>
          )}
          <div className="flex flex-col gap-1 -mt-1">
            <span>{point}</span>
            {detail && <span className="text-xs text-gray-400">{detail}</span>}
          </div>
        </li>
      ))}
    </ul>
  );
};
