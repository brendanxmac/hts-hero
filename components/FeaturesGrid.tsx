/* eslint-disable @next/next/no-img-element */
import React from "react";

interface TariffCheckerDummyResult {
  htsCode: string;
  impacted: boolean;
  notes: string;
}

const dummyResults: TariffCheckerDummyResult[] = [
  {
    htsCode: "2602.00.00.40",
    impacted: true,
    notes: "-",
  },

  {
    htsCode: "9701.21.00.00",
    impacted: false,
    notes: "-",
  },
  {
    htsCode: "4408.90.01.10",
    impacted: true,
    notes: "-",
  },

  {
    htsCode: "9701.21.00.00",
    impacted: false,
    notes: "-",
  },
  {
    htsCode: "2825.80.00.00",
    impacted: true,
    notes: "-",
  },

  {
    htsCode: "8544.49.20.00",
    impacted: true,
    notes: "-",
  },

  {
    htsCode: "9403.99.90.10",
    impacted: true,
    notes: "-",
  },
];

const features = [
  {
    title: "Enter your Codes",
    description:
      "Grab your codes from anywhere and paste them directly into the app.",
    styles: "bg-base-300 text-white",
    demo: (
      <div className="overflow-hidden h-full flex items-stretch">
        <div className="w-full translate-x-6 bg-base-200 rounded-t-box h-full p-6">
          <p className="font-medium uppercase tracking-wide text-base-content/60 text-sm mb-3">
            HTS Codes:
          </p>
          <div className="relative textarea py-4 h-full bg-base-100 border-base-content/10 text-base-content">
            <div className="absolute left-4 top-4 group-hover:hidden flex items-center ">
              <span className="w-[2px] h-5 bg-primary animate-pulse"></span>
            </div>
            <div className="opacity-0 group-hover:opacity-100 duration-500 flex flex-wrap">
              <span className="text-lg font-medium">
                2602.00.00.40, 9701.21.00.00, 4408.90.01.10, 9701.21.00.00,
                2825.80.00.00, 8544.49.20.00, 9403.99.90.10, 7614.10.10.00
              </span>
              {/* <span className="w-[2px] h-5 bg-primary animate-pulse"></span> */}
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "See which ones are affected",
    description:
      "Instantly see which HTS Codes are affected by the tariff updates",
    styles: "md:col-span-2 bg-base-300 text-white",
    demo: (
      <div className="overflow-x-auto ml-5 rounded-md bg-base-100">
        <table className="rounded-md table table-zebra table-lg table-pin-rows w-full">
          <thead>
            <tr>
              <th className="w-4"></th>
              <th>HTS Code</th>
              <th>Impacted</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {dummyResults.map((result, i) => {
              const { htsCode, impacted, notes } = result;
              return (
                <tr key={`${htsCode}-${i}`} className="py-1">
                  <td>{i + 1}</td>

                  <td className="truncate min-w-32 lg:min-w-64">
                    <p className="link link-primary font-bold">{htsCode}</p>
                  </td>

                  <td>{impacted ? "✅" : "❌"}</td>
                  <td>{notes}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    ),
  },
];
const FeaturesGrid = () => {
  return (
    <section className="flex justify-center items-center w-full bg-base-200 text-base-content px-6 py-20 lg:py-32">
      <div className="flex flex-col max-w-[82rem] gap-16 md:gap-20 px-4">
        <h2 className="font-black text-4xl md:text-5xl text-center">
          Copy, Paste, <span className="text-white">Clarity ✅</span>
        </h2>
        <div className="flex flex-col w-full h-fit gap-4 lg:gap-10 text-text-default max-w-[82rem]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-10">
            {features.map((feature) => (
              <div
                key={feature.title}
                className={`${feature.styles} rounded-3xl flex flex-col gap-6 w-full h-[22rem] lg:h-[25rem] pt-6 overflow-hidden group border border-base-content/10`}
              >
                <div className="px-6 space-y-2">
                  <h3 className="font-bold text-xl lg:text-3xl tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="opacity-80">{feature.description}</p>
                </div>
                {feature.demo}
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
