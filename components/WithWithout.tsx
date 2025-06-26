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
    title: "searching CROSS",
    time: "10 min",
  },
  {
    title: "fetching notes",
    time: "10 min",
  },
  {
    title: "finding references",
    time: "10 min",
  },
  {
    title: "creating reports",
    time: "10 min",
  },
  {
    title: "ensuring compliance",
    time: "?? min",
  },
];

const WithWithout = () => {
  return (
    <section className="bg-neutral-900">
      <div className="max-w-5xl mx-auto px-8 py-16 md:py-32 ">
        <h2 className="text-white text-center font-extrabold text-3xl md:text-5xl tracking-tight mb-8 md:mb-12">
          Are you still <span className="text-primary">manually</span>{" "}
          classifying?
        </h2>

        <div className="flex flex-col md:flex-row justify-center items-center md:items-start gap-8 md:gap-12">
          <div className="bg-primary/30 text-neutral-900 p-8 md:p-10 rounded-lg flex flex-col gap-4">
            {/* <div className="flex flex-col">
              <h3 className="text-2xl font-bold text-white text-center mb-2">
                Manual Tasks
              </h3>
              <hr className="w-full border border-primary/20" />
            </div> */}
            <ul className="flex flex-col gap-4 md:text-lg justify-start items-start">
              {/* Pains the user is experiencing by not using your product */}
              {painPoints.map((pain, index) => (
                <li key={index} className="flex gap-2 font-bold">
                  <p>
                    <span className="text-primary">
                      {index === 0 ? "\u00A0\u00A0\u00A0\u00A0" : "+ "}
                      {pain.time}
                      {"\u00A0\u00A0"}
                    </span>
                    <span className="text-neutral-100 font-semibold">
                      {pain.title}
                    </span>
                  </p>
                </li>
              ))}
            </ul>
            <li className="flex flex-col gap-2">
              <hr className="w-full border border-primary/20" />
              <div className="flex flex-col mt-5">
                <p className="text-primary font-bold text-3xl">~50 Minutes</p>
                <p className="text-white text-sm font-bold ml-6">
                  Per Classification
                </p>
              </div>
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
            href="/about/classifier#features"
          >
            There&apos;s a better way
          </Link>

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
