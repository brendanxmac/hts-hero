/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import React, { useState, useEffect } from "react";

interface TariffCheckerDummyResult {
  htsCode: string;
  impacted: boolean;
}

export const dummyTariffImpactResults: TariffCheckerDummyResult[] = [
  {
    htsCode: "2602.00.00.40",
    impacted: false,
  },
  {
    htsCode: "8544.49.20.00",
    impacted: true,
  },
  {
    htsCode: "9403.99.90.10",
    impacted: true,
  },
  {
    htsCode: "9701.21.00.00",
    impacted: false,
  },
  {
    htsCode: "4408.90.01.10",
    impacted: false,
  },
];

export const tariffImpactFeatures = [
  {
    title: "Select Tariff Announcement",
    description:
      "Select the tariff update / announcement you want to check against.",
    styles: "md:col-span-6 lg:col-span-2 bg-base-300 text-white",
    demo: (
      <div className="overflow-hidden h-full flex items-stretch">
        <div className="w-full bg-base-200 rounded-t-box h-full py-4 px-6">
          <div className="flex flex-col">
            <label
              htmlFor="hts-codes"
              className="font-medium uppercase tracking-wide text-base-content/60 text-sm mb-3"
            >
              Tariff Announcement:
            </label>
            <ul className="bg-base-100 border border-base-content/40 rounded-xl hover:bg-base-100 px-2 text-xs sm:text-sm md:text-base">
              <li className="p-3 rounded-sm truncate">
                <p>"Russian Oil" Exemptions | Aug 27th</p>
              </li>
              <li className="p-3 rounded-sm truncate">
                <p>Reciprocal Tariff Exemptions | April 5th</p>
              </li>
              <li className="p-3 bg-primary/80 rounded-lg">
                <div className="w-full flex justify-between items-center">
                  <p className="truncate">
                    Items of Steel & Aluminum | Aug 19th
                  </p>
                </div>
              </li>
              <li className="w-full p-3 truncate flex gap-2 items-center justify-between">
                <p>Furniture Tariffs | Pending</p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Enter Codes",
    description:
      "Grab your codes from anywhere and paste them directly into the app.",
    styles: "md:col-span-3 lg:col-span-2 bg-base-300 text-white",
  },
  {
    title: "See What's Affected",
    description:
      "Instantly see which HTS Codes are affected by the tariff updates",
    styles: "md:col-span-3 lg:col-span-2 bg-base-300 text-white",
  },
];
const FeaturesGrid = () => {
  const [completedCodes, setCompletedCodes] = useState<string[]>([]);
  const [currentCodeIndex, setCurrentCodeIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [currentPartialCode, setCurrentPartialCode] = useState("");

  useEffect(() => {
    // Start the typing cycle
    const startTyping = () => {
      setCompletedCodes([]);
      setCurrentCodeIndex(0);
      setCurrentCharIndex(0);
      setCurrentPartialCode("");
      setIsTyping(true);
    };

    startTyping();

    // Restart the entire cycle every 7 seconds
    const cycleTimer = setInterval(startTyping, 7000);

    return () => clearInterval(cycleTimer);
  }, []);

  useEffect(() => {
    // Handle typing animation
    if (!isTyping || currentCodeIndex >= dummyTariffImpactResults.length)
      return;

    const currentCode = dummyTariffImpactResults[currentCodeIndex].htsCode;

    if (currentCharIndex < currentCode.length) {
      // Type next character
      const typeTimer = setTimeout(() => {
        setCurrentPartialCode(currentCode.slice(0, currentCharIndex + 1));
        setCurrentCharIndex((prev) => prev + 1);
      }, 80); // Typing speed

      return () => clearTimeout(typeTimer);
    } else {
      // Code is complete - add to completed codes and update table
      const completeTimer = setTimeout(() => {
        setCompletedCodes((prev) => [...prev, currentCode]);
        setCurrentPartialCode("");
        setCurrentCodeIndex((prev) => prev + 1);
        setCurrentCharIndex(0);
      }, 100);

      return () => clearTimeout(completeTimer);
    }
  }, [currentCharIndex, currentCodeIndex, isTyping, dummyTariffImpactResults]);

  return (
    <section className="flex justify-center items-center w-full bg-base-200 text-base-content px-6 py-10 lg:py-16">
      <div className="w-full flex flex-col max-w-7xl lg:min-w-5xl gap-4 sm:gap-8">
        <div className="flex flex-col gap-2 md:gap-8 text-center lg:text-left lg:flex-1 items-center">
          <h1 className="text-white font-extrabold text-3xl md:text-5xl lg:text-6xl tracking-tight md:-mb-4 max-w-5xl text-center mx-auto">
            <span className="text-primary">Instantly</span> Know When & How New{" "}
            <br />
            Tariffs Affect Your Imports
          </h1>
          <p className="text-sm md:text-lg text-neutral-300 leading-relaxed max-w-5xl mx-auto">
            Save your bottom line and your sanity with copy & paste
          </p>

          <div className="flex justify-center lg:justify-start">
            <Link
              className="btn btn-wide btn-primary"
              href="/tariffs/impact-checker"
            >
              Check Now!
            </Link>
          </div>

          {/* <TestimonialsAvatars priority={true} /> */}
        </div>

        <div className="flex flex-col w-full h-fit gap-4 lg:gap-10 text-text-default max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            {tariffImpactFeatures.map((feature, index) => (
              <div
                key={feature.title}
                className={`${feature.styles} rounded-3xl flex flex-col gap-2 sm:gap-6 w-full h-[22rem] lg:h-[25rem] pt-6 overflow-hidden border-2 border-base-content/30`}
              >
                <div className="px-6 flex items-center gap-3">
                  <div className="rounded-full h-6 w-6 md:h-7 md:w-7 bg-primary text-base-300 text-sm md:text-base font-semibold flex items-center justify-center">
                    {index + 1}
                  </div>
                  <h3 className="text-lg sm:text-xl tracking-tight text-white font-semibold">
                    {feature.title}
                  </h3>
                </div>
                {index === 1 ? (
                  // First feature - typing animation
                  <div className="overflow-hidden h-full flex items-stretch">
                    <div className="w-full bg-base-200 rounded-t-box h-full py-4 px-6">
                      <p className="font-medium uppercase tracking-wide text-base-content/60 text-sm mb-3">
                        HTS Codes:
                      </p>
                      <div className="relative textarea py-4 h-full bg-base-100 border-base-content/10 text-base-content mr-2">
                        <div className="text-base md:text-lg font-medium text-white">
                          {/* Show completed codes */}
                          {completedCodes.map((code, i) => (
                            <span key={i}>
                              {code}
                              {i < completedCodes.length - 1 && ", "}
                              {i < completedCodes.length - 1 && <br />}
                            </span>
                          ))}

                          {/* Show current partial code being typed */}
                          {isTyping &&
                            currentCodeIndex <
                              dummyTariffImpactResults.length && (
                              <>
                                {completedCodes.length > 0 && ", "}
                                {completedCodes.length > 0 && <br />}
                                {currentPartialCode}
                                <span className={`w-[1px] h-5 text-primary`}>
                                  |
                                </span>
                              </>
                            )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : index === 2 ? (
                  // Second feature - opacity-based transition with purple pulse
                  <div className="overflow-x-auto bg-base-100 overflow-hidden">
                    <table className="rounded-md table table-zebra table-pin-rows w-full">
                      <thead>
                        <tr>
                          <th className="min-w-32">HTS Code</th>
                          <th>Impacted</th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* Show rows only for completed codes */}
                        {completedCodes.map((completedCode, i) => {
                          // Find matching result for this completed code
                          const result =
                            dummyTariffImpactResults.find(
                              (r) => r.htsCode === completedCode
                            ) ||
                            dummyTariffImpactResults[
                              i % dummyTariffImpactResults.length
                            ];
                          const { htsCode, impacted } = result;

                          return (
                            <tr
                              key={`${completedCode}-${i}`}
                              className="py-1 animate-[fadeInRow_0.2s_ease-in-out_forwards] border-transparent"
                            >
                              <td className="truncate min-w-32">
                                <p className="link link-primary font-bold">
                                  {htsCode}
                                </p>
                              </td>
                              <td className="text-2xl">
                                {impacted ? "✅" : "❌"}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  // Other features remain unchanged
                  feature.demo
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesGrid;

// {
//   title: "Fetches Notes & Rulings",
//   description: "Customize your Insighto board with 7 themes.",
//   styles: "md:col-span-2 bg-base-100 text-base-content",
//   demo: (
//     <div className="flex left-0 w-full h-full pt-0 lg:pt-8 overflow-hidden -mt-4">
//       <div className="-rotate-[8deg] flex min-w-max overflow-x-visible h-full lg:pt-4">
//         {[
//           {
//             buttonStyles: "bg-primary text-primary-content",
//             css: "-ml-1 rotate-[6deg] w-72 h-72 z-30 bg-base-200 text-base-content rounded-2xl group-hover:-ml-64 group-hover:opacity-0 group-hover:scale-75 transition-all duration-500 p-4",
//           },
//           {
//             buttonStyles: "bg-secondary text-secondary-content",
//             css: "rotate-[6deg] bg-base-200 text-base-content w-72 h-72 -mr-20 -ml-20 z-20 rounded-xl p-4",
//           },
//           {
//             buttonStyles: "bg-accent text-accent-content",
//             css: "rotate-[6deg] bg-base-200 text-base-content z-10 w-72 h-72 rounded-xl p-4",
//           },
//           {
//             buttonStyles: "bg-neutral text-neutral-content",
//             css: "rotate-[6deg] bg-base-200 text-base-content w-72 h-72 -ml-20 rounded-xl p-4",
//           },
//           {
//             buttonStyles: "bg-base-100 text-base-content",
//             css: "rotate-[6deg] bg-base-200 text-base-content w-72 h-72 -ml-10 -z-10 rounded-xl p-4 opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300",
//           },
//         ].map((theme, i) => (
//           <div className={theme.css} key={i}>
//             <div className="font-medium uppercase tracking-wide text-base-content/60 text-sm mb-3">
//               Trending feedback
//             </div>
//             <div className="space-y-2">
//               <div className="p-4 bg-base-100 rounded-box flex justify-between">
//                 <div>
//                   <p className="font-semibold mb-1">Clickable cards</p>
//                   <p className="opacity-80">Make cards more accessible</p>
//                 </div>
//                 <button
//                   className={`px-4 py-2 rounded-box group text-center text-lg duration-150 border border-transparent ${theme.buttonStyles}`}
//                 >
//                   <svg
//                     xmlns="http://www.w3.org/2000/svg"
//                     width="24"
//                     height="24"
//                     viewBox="0 0 24 24"
//                     fill="none"
//                     stroke="currentColor"
//                     strokeWidth="2.5"
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     className={`w-5 h-5 ease-in-out duration-150 -translate-y-0.5 group-hover:translate-y-0`}
//                   >
//                     <path d="m18 15-6-6-6 6" />
//                   </svg>
//                   8
//                 </button>
//               </div>
//               <div className="p-4 bg-base-100 rounded-box flex justify-between ">
//                 <div>
//                   <p className="font-semibold mb-1">Bigger images</p>
//                   <p className="opacity-80">Make cards more accessible</p>
//                 </div>
//                 <button
//                   className={`px-4 py-2 rounded-box group text-center text-lg duration-150 border border-transparent ${theme.buttonStyles}`}
//                 >
//                   <svg
//                     xmlns="http://www.w3.org/2000/svg"
//                     width="24"
//                     height="24"
//                     viewBox="0 0 24 24"
//                     fill="none"
//                     stroke="currentColor"
//                     strokeWidth="2.5"
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     className={`w-5 h-5 ease-in-out duration-150 -translate-y-0.5 group-hover:translate-y-0`}
//                   >
//                     <path d="m18 15-6-6-6 6" />
//                   </svg>
//                   5
//                 </button>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   ),
// },
// {
//   title: "Generates Reports",
//   description: "Users can chat and discuss features.",
//   styles: "bg-neutral text-neutral-content",
//   demo: (
//     <div className="text-neutral-content px-6 space-y-4">
//       {[
//         {
//           id: 1,
//           text: "Can we have a feature to add a custom domain to IndiePage?",
//           userImg:
//             "https://pbs.twimg.com/profile_images/1514863683574599681/9k7PqDTA_400x400.jpg",
//           userName: "Marc Lou",
//           createdAt: "2024-09-01T00:00:00Z",
//         },
//         {
//           id: 2,
//           text: "I'd definitelly pay for that 🤩",
//           userImg:
//             "https://pbs.twimg.com/profile_images/1778434561556320256/knBJT1OR_400x400.jpg",
//           userName: "Dan K.",
//           createdAt: "2024-09-02T00:00:00Z",
//           transition:
//             "opacity-0 group-hover:opacity-100 duration-500 translate-x-1/4 group-hover:translate-x-0",
//         },
//       ]?.map((reply) => (
//         <div
//           key={reply.id}
//           className={`px-6 py-4 bg-neutral-content text-neutral rounded-box ${reply?.transition}`}
//         >
//           <div className="mb-2 whitespace-pre-wrap">{reply.text}</div>
//           <div className="text-neutral/80 flex items-center gap-2 text-sm">
//             <div className="flex items-center gap-2">
//               <div className="avatar">
//                 <div className="w-7 rounded-full">
//                   <img src={reply.userImg} alt={reply.userName} />
//                 </div>
//               </div>
//               <div className=""> {reply.userName} </div>
//             </div>
//             •
//             <div>
//               {new Date(reply.createdAt).toLocaleDateString("en-US", {
//                 month: "short",
//                 day: "numeric",
//                 year: "numeric",
//               })}
//             </div>
//           </div>
//         </div>
//       ))}
//     </div>
//   ),
// },
