"use client";

import { useState, useRef } from "react";
import type { JSX } from "react";
import { FeaturePoint, FeaturePoints } from "./FeaturePoints";
import DocumentSearchSVG from "./svg/DocumentSearchSVG";
import LightBulbSVG from "./svg/LightBulbSVG";
import DocumentCheckSVG from "./svg/DocumentCheckSVG";
import { classNames } from "../utilities/style";
import { RegistrationTrigger } from "../libs/early-registration";
import LightningSVG from "./svg/LightningSVG";
import SearchSVG from "./svg/SearchSVG";
import Link from "next/link";

const features: {
  name: string;
  points: FeaturePoint[];
  svg: JSX.Element;
}[] = [
  {
    name: "Discovers Headings",
    points: [
      {
        point:
          "Jump start classification for any item by immediately seeing the most likely headings",
      },
      {
        point: "Discover headings you might have missed",
      },
      {
        point: "Easily find & apply your own, if needed",
      },
      {
        point: "~20 minutes saved",
        detail: "per classification",
        isKey: true,
      },
    ],
    svg: <LightningSVG color="#40C969" size={7} viewBox="0 0 24 24" />,
  },
  {
    name: "Suggests Best Candidate",
    points: [
      {
        point:
          "At every level of classification, HTS Hero suggests the best option available",
        detail: "⚡️ Greatly improves classification speed for complex items",
      },
      {
        point:
          "Each suggestion includes an explanation based on the GRI & Additional US Rules",
        detail: "Formatted to read just like a CROSS ruling",
      },
      {
        point:
          "Suggestions are automatically added to your reports, ready to share with clients or customs",
      },
      {
        point: "~10 minutes saved",
        detail: "per classification",
        isKey: true,
      },
    ],
    svg: <LightBulbSVG color="#40C969" size={7} viewBox="0 0 24 24" />,
  },
  {
    name: "Generates Reports",
    points: [
      {
        point:
          "Generate client-ready classification reports, in a single click",
      },
      {
        point:
          "Includes all reasoning and a detailed breakdown for each selection",
      },
      {
        point: "Easily store for your own records & auditability",
      },
      {
        point: "~20 minutes saved",
        detail: "per classification",
        isKey: true,
      },
    ],
    svg: <DocumentCheckSVG color="#40C969" size={7} viewBox="0 0 24 24" />,
  },
  {
    name: "Fetches Notes",
    points: [
      {
        point:
          "See the notes that might impact your classification, without leaving the page",
        detail: "General, Section, Chapter, Subheading, etc...",
      },
      {
        point: "Quickly find the details of HTS references with missing links",
        detail: `e.g. "See heading 9902.22.84" or "Articles of heading 4601"`,
      },
      // {
      //   point: "Summarize complex or lengthy note for easy understanding",
      // },
      {
        point: "~10 minutes saved",
        detail: "per classification",
        isKey: true,
      },
    ],
    svg: <DocumentSearchSVG color="#40C969" size={7} viewBox="0 0 24 24" />,
  },
  {
    name: "Simplifies Search",
    points: [
      {
        point:
          "A brand new HTS explorer tailor-made for brokers and forwarders",
      },
      {
        point:
          "Built in PDF viewer - No more downloads or opening another tab just to find what you're looking for",
      },
      {
        point: "Built specifically to improve on the USITC website",
        isKey: true,
      },
    ],
    svg: <SearchSVG color="#40C969" size={7} viewBox="0 0 24 24" />,
  },
  // {
  //   name: "CROSS Rulings",
  //   points: [
  //     {
  //       point: "See CROSS rulings related to the item you're classifying",
  //     },
  //     {
  //       point:
  //         "Include rulings as attachments for your classification report, if desired",
  //     },
  //     { point: "~20 min saved", detail: "per classification", isKey: true },
  //   ],
  //   svg: <CheckBadgeSVG color="#40C969" size={7} viewBox="0 0 24 24" />,
  // },
  // {
  //   name: "Product Analysis",
  //   points: [
  //     {
  //       point: "Composition Analysis",
  //       // detail: "Finds the ratios of each element of the product",
  //     },
  //     {
  //       point: "Essential Character Analysis",
  //       // detail: "GRI 3(b)",
  //     },
  //     {
  //       point: "Primary Use Analysis",
  //       // detail: "Additional US Rules",
  //     },
  //     {
  //       point: "~10 minutes saved",
  //       detail: "per classification",
  //       isKey: true,
  //     },
  //   ],
  //   svg: <PuzzlePieceSVG color="#40C969" size={7} viewBox="0 0 24 24" />,
  // },
  // {
  //   name: "And Much More",
  //   points: [
  //     {
  //       point: "A brand new HTS explorer tailor-made for experts",
  //     },
  //     {
  //       point:
  //         "Comprehensive product descriptions from clients without all the back and forth",
  //     },
  //     {
  //       point: "Automatic record keeping of all your classifications",
  //     },
  //     {
  //       point:
  //         "Ability to save & favorite CROSS rulings and notes for quick reference when needed",
  //     },
  //   ],
  //   svg: <MoreSVG color="#40C969" size={7} viewBox="0 0 24 24" />,
  // },
];

const FeaturesListicle = ({
  setIsRegisterOpen,
  setRegistrationTrigger,
}: {
  setIsRegisterOpen: (isOpen: boolean) => void;
  setRegistrationTrigger: (trigger: RegistrationTrigger) => void;
}) => {
  const featuresEndRef = useRef<null>(null);
  const [featureSelected, setFeatureSelected] = useState<string>(
    features[0].name
  );
  const [hasClicked, setHasClicked] = useState<boolean>(false);

  return (
    <section className="py-24" id="features">
      <div className="max-w-4xl mx-auto">
        <div className="bg-base-100 max-md:px-8 max-w-4xl mb-8 md:px-12">
          <h2 className="text-white font-extrabold text-4xl lg:text-5xl tracking-tight mb-5">
            {/* 💡 COPY TIP: Remind visitors about the value of your product. Why do they need it? */}
            Autocomplete for Classifiers
          </h2>
          <div className="text-neutral-300 leading-relaxed mb-3 lg:text-lg">
            {/* 💡 COPY TIP: Explain how your product delivers what you promise in the headline. */}
            Automate time-consuming classification tasks & get the information
            you need to classify quickly with confidence.
          </div>
        </div>
      </div>

      <div className="mx-6 md:mx-12">
        <div className="grid grid-cols-3 md:flex justify-between px-2 gap-4 max-w-3xl mx-auto mb-8">
          {features.map((feature) => (
            <div
              key={feature.name}
              onClick={() => {
                if (!hasClicked) setHasClicked(true);
                setFeatureSelected(feature.name);
              }}
              className={classNames(
                featureSelected === feature.name
                  ? "border-2 border-primary"
                  : "hover:scale-[1.03] cursor-pointer",
                "flex flex-col items-center justify-center gap-3 p-2 duration-100 group rounded-lg border-2 border-transparent"
              )}
            >
              <span
                className={`duration-100 shrink-0 ${
                  featureSelected === feature.name
                    ? "text-primary"
                    : "text-base-content/60 group-hover:text-white"
                }`}
              >
                {feature.svg}
              </span>
              <p
                className={`font-semibold text-sm text-center ${
                  featureSelected === feature.name
                    ? "text-primary"
                    : "text-base-content/60 group-hover:text-white"
                }`}
              >
                {feature.name}
              </p>
            </div>
          ))}
        </div>
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-col md:flex-row justify-center md:justify-start md:items-center gap-12">
            <div
              className="leading-relaxed space-y-4 max-w-3xl animate-opacity"
              key={featureSelected}
            >
              <h3 className="text-white font-semibold text-lg">
                {features.find((f) => f.name === featureSelected)["name"]}
              </h3>

              <FeaturePoints
                points={
                  features.find((f) => f.name === featureSelected)["points"]
                }
              />
            </div>
          </div>
          <Link
            className="mt-8 btn btn-primary btn-wide"
            href={"/about/classifier#pricing"}
            // onClick={() => {
            //   const trigger =
            //     featureSelected === "Notes & References"
            //       ? RegistrationTrigger.feature_notes
            //       : featureSelected === "CROSS Rulings"
            //         ? RegistrationTrigger.feature_cross_rulings
            //         : featureSelected === "Match Suggestions"
            //           ? RegistrationTrigger.feature_match_suggestions
            //           : featureSelected === "Product Analysis"
            //             ? RegistrationTrigger.feature_product_analysis
            //             : featureSelected === "Report Generation"
            //               ? RegistrationTrigger.feature_report_generation
            //               : RegistrationTrigger.feature_more_features;
            //   setIsRegisterOpen(true);
            //   setRegistrationTrigger(trigger);
            // }}
          >
            Try it now!
            {/* Get {config.appName} */}
          </Link>
        </div>
      </div>
      {/* Just used to know it's the end of the autoscroll feature (optional, see useEffect) */}
      <p className="opacity-0" ref={featuresEndRef}></p>
    </section>
  );
};

export default FeaturesListicle;
