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
            <ul className="bg-base-100 border border-base-content/40 rounded-xl hover:bg-base-100 px-2 text-sm md:text-base">
              <li className="p-3 rounded-sm truncate">
                <p>"Russian Oil" Exemptions</p>
              </li>
              <li className="p-3 rounded-sm truncate">
                <p>Reciprocal Tariff Exemptions</p>
              </li>
              <li className="p-3 bg-base-300 rounded-lg">
                <div className="w-full flex justify-between items-center">
                  <p className="truncate">Items of Steel & Aluminum</p>
                </div>
              </li>
              <li className="w-full p-3 truncate flex gap-2 items-center justify-between">
                <p>Furniture Tariffs (Coming Soon)</p>
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
        <div className="flex flex-col gap-2 md:gap-4 text-center lg:text-left lg:flex-1 items-center">
          <h1 className="text-white font-extrabold text-3xl sm:text-4xl md:text-6xl lg:text-7xl tracking-tight md:-mb-4 max-w-5xl text-center mx-auto">
            <span className="text-primary">Instantly</span> Know How New Tariffs
            Affect Your Imports
          </h1>
          <p className="text-sm md:text-lg lg:text-xl text-neutral-300 leading-relaxed max-w-5xl mx-auto md:mt-4">
            Get notified, gain clarity, and take action with confidence.
          </p>

          <div className="flex justify-center lg:justify-start">
            <Link
              className="btn btn-wide btn-primary"
              href="/tariffs/impact-checker"
            >
              Check Your Imports
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
