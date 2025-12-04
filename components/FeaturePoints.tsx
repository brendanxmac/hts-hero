import { classNames } from "../utilities/style";

export interface FeaturePoint {
  point: string;
  detail?: string;
  isKey?: boolean;
  comingSoon?: boolean;
}

interface Props {
  points: FeaturePoint[];
}

export const FeaturePoints = ({ points }: Props) => {
  return (
    <ul className="space-y-4">
      {points.map(({ point, detail, isKey, comingSoon }) => (
        <li
          key={point}
          className={classNames(
            "flex items-start gap-3",
            isKey && "text-primary pt-3 text-xl font-extrabold",
            !isKey && "text-base-content"
          )}
        >
          {!isKey && !comingSoon && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="text-primary shrink-0 size-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m4.5 12.75 6 6 9-13.5"
              />
            </svg>
          )}
          {comingSoon && (
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
                d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>

            // <span className="text-xs text-gray-400">Coming Soon</span>
          )}
          <div className="flex flex-col gap-1 -mt-1 md:text-lg">
            <span>{point}</span>

            {detail && (
              <span className="text-xs text-base-content/60">{detail}</span>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
};
