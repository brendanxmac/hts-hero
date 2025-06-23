"use client";

import { useState, useRef } from "react";
import type { JSX } from "react";
import { FeaturePoint, FeaturePoints } from "../FeaturePoints";
import LightBulbSVG from "../svg/LightBulbSVG";
import DocumentCheckSVG from "../svg/DocumentCheckSVG";
import { classNames } from "../../utilities/style";
import LightningSVG from "../svg/LightningSVG";
import Link from "next/link";

const features: {
  name: string;
  points: FeaturePoint[];
  svg: JSX.Element;
}[] = [
  {
    name: "Stand Out from the Crowd",
    points: [
      {
        point:
          "Offer an affordable, modern, & fast classification tool your clients will love.",
      },
      {
        point:
          "Frees up your classifiers to work on other parts of the business",
      },
      {
        point: "Drives more revenue via upsells & established trust",
      },
      {
        point: "Result: more clients & more upsells",
        isKey: true,
      },
    ],
    svg: <LightningSVG color="#40C969" size={7} viewBox="0 0 24 24" />,
  },
  {
    name: "Capture More Clients & Upsells",
    points: [
      {
        point:
          "At every level of classification, HTS Hero suggests the best option available",
        // detail: "⚡️ Greatly improves classification speed for complex items",
      },
      {
        point:
          "Each suggestion includes an explanation based on the GRI & Additional US Rules",
        // detail: "Formatted to read just like a CROSS ruling",
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
    name: "Plug & Play",
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
];

const FeaturesListicle = () => {
  const featuresEndRef = useRef<null>(null);
  const [featureSelected, setFeatureSelected] = useState<string>(
    features[0].name
  );
  const [hasClicked, setHasClicked] = useState<boolean>(false);

  return (
    <section className="py-24" id="features">
      <div className="max-w-5xl mx-auto">
        <div className="bg-base-100 max-md:px-8 max-w-5xl mb-8 md:px-12">
          <h2 className="text-white font-extrabold text-4xl md:text-5xl lg:text-6xl tracking-tight mb-5">
            {/* 💡 COPY TIP: Remind visitors about the value of your product. Why do they need it? */}
            {/* Classifications that Drive Revenue  */}
            Expand Revenue via Classifications
          </h2>
          <div className="text-neutral-300 leading-relaxed mb-3 lg:text-lg">
            {/* 💡 COPY TIP: Explain how your product delivers what you promise in the headline. */}
            HTS Hero enables low or no-touch classifications & provides an
            afforable yet premium experience that builds trust.
          </div>
        </div>
      </div>

      <div className="mx-6 md:mx-12">
        <div className="grid grid-cols-3 md:flex justify-between px-2 gap-4 max-w-4xl mx-auto mb-8">
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
        <div className="max-w-4xl mx-auto">
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
