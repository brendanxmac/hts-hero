"use client";

import { useState, useRef } from "react";
import type { JSX } from "react";
import { FeaturePoint, FeaturePoints } from "./FeaturePoints";
import DocumentSearchSVG from "./svg/DocumentSearchSVG";
import LightBulbSVG from "./svg/LightBulbSVG";
import DocumentCheckSVG from "./svg/DocumentCheckSVG";
import { classNames } from "../utilities/style";
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
          "Jump start any classification by automatically seeing potential headings",
      },
      {
        point: "Discover headings you might have missed",
      },
      {
        point: "Easily find & apply your own",
      },
      {
        point: "~15 minutes saved",
        detail: "per classification",
        isKey: true,
      },
    ],
    svg: <LightningSVG color="#40C969" size={7} viewBox="0 0 24 24" />,
  },
  {
    name: "Suggests Candidates",
    points: [
      {
        point: "Suggests a best match at every level of classification",
      },
      {
        point: "Provides reasoning based on the GRI & Additional US Rules",
      },
      {
        point: "Lets you add your own notes or reasoning",
        detail: "-> Which are automatically included in your reports",
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
        point: "Generate classification reports, in a single click",
        detail: "A clean & easy to digest report of your decisions",
      },
      {
        point: "Includes all your notes and a breakdown of each selection",
        detail: "Coming Soon: Apply your logo and branding to your reports",
      },
      {
        point: "Easily export & share with your clients or customs",
        detail:
          "Coming Soon: Email directly to clients & generate secure view-only links",
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
      {
        point: "Coming Soon: Get help parsing complex or lengthy notes",
        comingSoon: true,
      },
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
        point: "A brand new HTS explorer tailor-made for brokers",
      },
      {
        point:
          "Built in PDF viewer - No more downloads or opening new tabs to find what you're looking for",
      },
      {
        point: "Coming Soon: Automatic CROSS ruling lookup",
        comingSoon: true,
      },
      {
        point: "~10 minutes saved",
        detail: "per classification",
        isKey: true,
      },
    ],
    svg: <SearchSVG color="#40C969" size={7} viewBox="0 0 24 24" />,
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
            {/* Turbocharged Classifications */}
            {/* Classifications, Turbocharged */}
            Your Classification Sidekick
          </h2>
          <div className="text-neutral-300 leading-relaxed mb-3 lg:text-lg">
            {/* 💡 COPY TIP: Explain how your product delivers what you promise in the headline. */}
            {/* HTS Hero helps you classify quickly with confidence & creates a
            delightful client experience. */}
            {/* HTS Hero finds the information you need to classify quickly with
            confidence and creates a delightful experience for your clients. */}
            HTS Hero finds the information you need to classify and generates
            polished client reports.
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
