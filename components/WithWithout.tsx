// A useful component when your product is challenging the status quo.
// Highlight the current pain points (left) and how your product is solving them (right)

import Link from "next/link";

// Try to match the lines from left to right, so the user can easily compare the two columns
interface PainPoint {
  title: string;
  time: string;
}

const painPoints: PainPoint[] = [
  {
    title: "Finding Headings",
    time: "15 min",
  },
  {
    title: "Searching CROSS",
    time: "10 min",
  },
  {
    title: "Fetching Notes",
    time: "10 min",
  },
  {
    title: "Finding References",
    time: "10 min",
  },
  {
    title: "Creating Reports",
    time: "15 min",
  },
  // {
  //   title: "Finding & Updating Previous Classifications",
  //   time: "?? min",
  // },
];

const pleasurePoints: PainPoint[] = [
  {
    title: "Finding Headings",
    time: "2 min",
  },
  {
    title: "Searching CROSS",
    time: "2 min",
  },
  {
    title: "Fetching Notes",
    time: "1 min",
  },
  {
    title: "Finding References",
    time: "5 min",
  },
  {
    title: "Creating Reports",
    time: "0 min",
  },
  // {
  //   title: "Finding & Updating Previous Classifications",
  //   time: "30 sec",
  // },
];

const WithWithout = () => {
  return (
    <section className="bg-base-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-12 sm:py-16 md:py-24">
        <h2 className="text-center font-black text-white text-4xl sm:text-5xl lg:text-6xl mb-6 sm:mb-8 md:mb-10 lg:mb-12">
          <span className="text-green-500">Supercharge</span> Your
          Classifications
        </h2>

        <div className="flex flex-col lg:flex-row justify-center items-center lg:items-start gap-4 sm:gap-6 md:gap-8 lg:gap-12">
          {/* Without HTS Hero Card */}
          <div className="bg-base-100 backdrop-blur-sm text-white p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl flex flex-col gap-4 sm:gap-6 shadow-2xl border border-neutral-600/30 w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-md">
            <div className="flex flex-col items-center justify-center gap-3">
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
                  Classification
                  <br />
                  <span className="text-red-400">Without</span> HTS Hero
                </h2>
              </div>
            </div>

            <ul className="flex flex-col gap-1 sm:gap-2">
              {painPoints.map((pain, index) => (
                <li
                  key={index}
                  className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-base-300/80 rounded-lg border border-gray-700"
                >
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2 sm:gap-3 md:gap-4">
                      <span className="text-neutral-200 font-semibold md:text-xl">
                        {pain.title}
                      </span>
                      <span className="text-red-200 font-bold text-sm sm:text-base md:text-lg bg-red-900/50 px-2 sm:px-3 py-1 rounded-full flex-shrink-0 whitespace-nowrap border border-red-700/30">
                        {pain.time}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-auto pt-2 sm:pt-3">
              <div className="text-center">
                <p className="text-red-400 font-bold text-2xl sm:text-3xl md:text-4xl mb-1 sm:mb-2">
                  ~1 Hour
                </p>
              </div>
              <p className="text-center text-neutral-300 text-xs sm:text-sm md:text-lg mt-1 sm:mt-2 font-medium">
                Manual, time-consuming process
              </p>
            </div>
          </div>

          {/* With HTS Hero Card */}
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
                  Classification
                  <br />
                  <span className="text-green-400">With</span> HTS Hero
                </h2>
              </div>
            </div>

            <ul className="flex flex-col gap-1 sm:gap-2">
              {pleasurePoints.map((pleasure, index) => (
                <li
                  key={index}
                  className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-base-300/80 rounded-lg border border-gray-700"
                >
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2 sm:gap-3 md:gap-4">
                      <span className="text-neutral-200 font-semibold md:text-xl">
                        {pleasure.title}
                      </span>
                      <span className="text-green-200 font-bold text-sm sm:text-base md:text-lg bg-green-900/50 px-2 sm:px-3 py-1 rounded-full flex-shrink-0 whitespace-nowrap border border-green-700/30">
                        {pleasure.time}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-auto pt-2 sm:pt-3">
              <div className="text-center">
                <p className="text-green-400 font-bold text-2xl sm:text-3xl md:text-4xl mb-1 sm:mb-2">
                  ~10 Minutes
                </p>
              </div>
              <p className="text-center text-neutral-300 text-xs sm:text-sm md:text-lg mt-1 sm:mt-2 font-medium">
                Streamlined, efficient workflow
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-1 w-full mt-8 sm:mt-10 md:mt-12 lg:mt-16 xl:mt-24 animate-pulse">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-3 h-3 sm:w-4 sm:h-4 text-neutral-300"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3"
            />
          </svg>

          <Link
            className="text-center text-xs sm:text-sm text-neutral-300 tracking-tight"
            href="/about#features"
          >
            There&apos;s a better way
          </Link>

          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-3 h-3 sm:w-4 sm:h-4 text-neutral-300"
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
