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
    title: "finding headings",
    time: "10 min",
  },
  {
    title: "fetching relevant notes",
    time: "10 min",
  },
  {
    title: "looking up references",
    time: "10 min",
  },
  {
    title: "finding CROSS rulings",
    time: "20 min",
  },
  {
    title: "for tariff calculation",
    time: "15 min",
  },
  {
    title: "creating client reports",
    time: "30 min",
  },
];

const WithWithout = () => {
  return (
    <section className="bg-neutral-900">
      <div className="max-w-5xl mx-auto px-8 py-16 md:py-32 ">
        <h2 className="text-center font-extrabold text-3xl md:text-5xl tracking-tight mb-8 md:mb-12">
          {/* Spending too much time classifying products? */}
          {/* Tired of lengthy classifications? */}
          {/* Tired of Tedious Classification Work? */}
          Classifications are Tedious
        </h2>

        <div className="flex flex-col md:flex-row justify-center items-center md:items-start gap-8 md:gap-12">
          <div className="bg-red-900/30 text-neutral-900 p-8 md:p-16 rounded-lg">
            {/* <h3 className="text-red-600 font-bold text-lg mb-4">
              Classification without HTS Hero
            </h3> */}

            <ul className="flex flex-col gap-4 md:text-lg">
              {/* Pains the user is experiencing by not using your product */}
              {painPoints.map((pain, index) => (
                <li key={index} className="flex gap-2 items-center font-bold">
                  <p>
                    <span className="text-red-600">
                      {index === 0 ? "\u00A0\u00A0\u00A0" : "+"}
                      {pain.time}
                      {"\u00A0\u00A0"}
                    </span>
                    <span className="text-neutral-300 font-semibold">
                      {pain.title}
                    </span>
                  </p>
                </li>
              ))}
            </ul>
            <li className="flex flex-col gap-2 mt-2">
              <hr className="w-full border border-red-600/20 mt-3" />
              <div className="flex gap-2 items-end mt-5 justify-center">
                <span className="text-red-600 font-bold text-2xl">
                  ~ 1.5 hrs
                </span>
                <span className="text-red-600 font-bold">
                  Per Classification
                </span>
              </div>
              {/* <div className="flex gap-2 items-center -mt-2">
                // <span className="text-red-600 font-bold">
                //   Per Classification
                // </span>
              </div> */}
            </li>
          </div>

          {/* <div className="bg-success/20 text-success p-8 md:p-12 rounded-lg w-full">
            <h3 className="font-bold text-lg mb-4">
              Classifications with HTS Hero
            </h3>

            <ul className="flex flex-col gap-2">
              {pleasurePoints.map((pleasure, index) => (
                <li key={index} className="flex gap-2 items-center">
                  <span className="text-success font-bold">
                    {pleasure.time}
                  </span>
                  <span className="text-neutral-400">{pleasure.title}</span>
                </li>
              ))}
              <li className="flex flex-col gap-2 mt-2">
                <div className="flex gap-2 items-center">
                  <span className="text-success font-bold text-2xl">~</span>
                  <span className="text-success font-bold text-2xl">
                    1.5 hrs
                  </span>
                </div>
                <div className="flex gap-2 items-center -mt-2">
                  <span className="text-success font-bold animate-pulse">
                    Per Classification
                  </span>
                </div>
              </li>
            </ul>
          </div> */}
        </div>

        <div className="flex items-center justify-center gap-1 w-full mt-8 md:mt-12 animate-pulse">
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

          <Link
            className="text-center text-sm text-neutral-300 tracking-tight"
            href="/about#features"
          >
            There&apos;s an easier way
          </Link>
        </div>
      </div>
    </section>
  );
};

export default WithWithout;
