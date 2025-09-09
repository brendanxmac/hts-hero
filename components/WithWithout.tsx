import Link from "next/link";
// A useful component when your product is challenging the status quo.
// Highlight the current pain points (left) and how your product is solving them (right)

// Try to match the lines from left to right, so the user can easily compare the two columns
export interface Task {
  title: string;
  time: string;
}

export interface KeyPoint {
  title: string;
  detail?: string;
}

interface Props {
  title: string;
  subtitle?: string;
  withKeyPoint?: KeyPoint;
  withoutKeyPoint: KeyPoint;
  withList?: Task[];
  withoutList: Task[];
  ctaText?: string;
  ctaLink?: string;
}

const WithWithout = ({
  title,
  subtitle,
  withKeyPoint,
  withoutKeyPoint,
  withList,
  withoutList,
  ctaText,
  ctaLink,
}: Props) => {
  return (
    <section className="bg-base-300">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-12 sm:py-16 md:py-24">
        <div className="flex flex-col gap-4 mb-8 items-center">
          <h2 className="text-center font-black text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl">
            {title}
          </h2>
          {subtitle && (
            <h3 className="text-center sm:text-lg lg:text-xl">{subtitle}</h3>
          )}
          {ctaText && ctaLink && (
            <div className="flex justify-center lg:justify-start">
              <Link className="btn btn-wide btn-primary" href={ctaLink}>
                {ctaText}
              </Link>
            </div>
          )}
        </div>
        <div className="flex flex-col lg:flex-row justify-center items-center lg:items-start gap-4 sm:gap-6 md:gap-8 lg:gap-12">
          {/* Without HTS Hero Card */}
          <div className="bg-base-100 backdrop-blur-sm text-white p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl flex flex-col gap-4 sm:gap-6 shadow-2xl border border-neutral-600/30 w-full max-w-sm sm:max-w-md lg:max-w-2xl">
            {/* <div className="flex flex-col items-center justify-center gap-3">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-red-900/50 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-6 h-6 sm:w-7 sm:h-7 md:w-10 md:h-10 text-red-300"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
                  />
                </svg>
              </div>
              <div className="flex flex-col items-center justify-center">
                <h2 className="text-center text-white text-2xl sm:text-3xl lg:text-4xl font-bold">
                  <span className="text-red-400">Without</span> HTS Hero
                </h2>
              </div>
            </div> */}

            <ul className="flex flex-col gap-1 sm:gap-2">
              {withoutList.map((task, index) => (
                <li
                  key={index}
                  className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-base-300/80 rounded-lg border border-gray-700"
                >
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2 sm:gap-3 md:gap-4">
                      <span className="text-neutral-200 font-semibold md:text-xl">
                        {task.title}
                      </span>
                      <span className="text-red-200 font-bold text-sm sm:text-base md:text-lg bg-red-900/50 px-2 sm:px-3 py-1 rounded-full flex-shrink-0 whitespace-nowrap border border-red-700/30">
                        {task.time}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-auto pt-2 sm:pt-3">
              <div className="text-center">
                <p className="text-red-400 font-bold text-2xl sm:text-3xl md:text-4xl mb-1 sm:mb-2">
                  {withoutKeyPoint.title}
                </p>
              </div>
              <p className="text-center text-neutral-300 text-xs sm:text-sm md:text-lg mt-1 sm:mt-2 font-medium">
                {withoutKeyPoint.detail || ""}
              </p>
            </div>
          </div>

          {/* With HTS Hero Card */}
          {withList && (
            <div className="bg-base-100 backdrop-blur-sm text-white p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl flex flex-col gap-4 sm:gap-6 shadow-2xl border border-gray-700 w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-md">
              <div className="flex flex-col items-center justify-center gap-3">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-green-900/50 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-6 h-6 sm:w-7 sm:h-7 md:w-10 md:h-10 text-green-300"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                    />
                  </svg>
                </div>
                <div className="flex flex-col items-center justify-center">
                  <h2 className="text-center text-white text-2xl sm:text-3xl lg:text-4xl font-bold">
                    <span className="text-green-400">With</span> HTS Hero
                  </h2>
                </div>
              </div>

              <ul className="flex flex-col gap-1 sm:gap-2">
                {withList.map((task, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-base-300/80 rounded-lg border border-gray-700"
                  >
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2 sm:gap-3 md:gap-4">
                        <span className="text-neutral-200 font-semibold md:text-xl">
                          {task.title}
                        </span>
                        <span className="text-green-200 font-bold text-sm sm:text-base md:text-lg bg-green-900/50 px-2 sm:px-3 py-1 rounded-full flex-shrink-0 whitespace-nowrap border border-green-700/30">
                          {task.time}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-2 sm:pt-3">
                <div className="text-center">
                  <p className="text-green-400 font-bold text-2xl sm:text-3xl md:text-4xl mb-1 sm:mb-2">
                    {withKeyPoint.title}
                  </p>
                </div>
                <p className="text-center text-neutral-300 text-xs sm:text-sm md:text-lg mt-1 sm:mt-2 font-medium">
                  {withKeyPoint.detail || ""}
                </p>
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center justify-center gap-1 w-full mt-4 md:mt-8 animate-pulse">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-4 h-4 text-neutral-300"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3"
            />
          </svg>

          <p className="text-center text-sm text-neutral-300 tracking-tight">
            There&apos;s a better way
          </p>

          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-4 h-4 text-neutral-300"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3"
            />
          </svg>
        </div>
      </div>
    </section>
  );
};

export default WithWithout;
