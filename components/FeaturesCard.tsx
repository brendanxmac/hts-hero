export interface FeatureI {
  title: string;
  svg: JSX.Element;
  points: string[];
}

export const FeaturesCard = ({ svg, title, points }: FeatureI) => {
  return (
    <div className="bg-[#40C969] bg-opacity-20 p-4 md:p-8 rounded-md w-full">
      <div className="flex items-center gap-3 mb-4">
        {svg}
        <h3 className="font-bold md:text-lg lg:text-xl text-white">{title}</h3>
      </div>

      <ul className="list-disc list-inside space-y-1.5 ">
        {/* Features of your product fixing the pain (try to match each with/withot lines) */}
        {points.map((item, index) => (
          <li key={index} className="flex gap-2 items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              className="w-4 h-4 shrink-0 opacity-75"
            >
              <path
                fillRule="evenodd"
                d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z"
                clipRule="evenodd"
              />
            </svg>

            {item}
          </li>
        ))}
      </ul>
    </div>
  );
};
