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
import CursorSVG from "./svg/CursorSVG";

const features: {
  name: string;
  points: FeaturePoint[];
  svg: JSX.Element;
}[] = [
  {
    name: "Finds Headings",
    points: [
      {
        point: "Enter an item description and get suitable headings in seconds",
      },
      {
        point:
          "Jump-starts your classifications instead of you starting from scratch",
      },
      {
        point: "Discover headings you might have missed",
      },
      {
        point: "Lets you easily find & apply your own",
      },
      {
        point: "~10 minutes saved",
        detail: "per classification",
        isKey: true,
      },
    ],
    svg: <LightningSVG color="#40C969" size={7} viewBox="0 0 24 24" />,
  },
  {
    name: "Analyzes Candidates",
    points: [
      {
        point: "Gives you a GRI analysis of the candidates at every level",
      },
      {
        point: "Helps you quickly find the best candidate",
      },
      {
        point: "Lets you easily add your own notes for any decision",
        detail:
          "Which are automatically included in your reports and help refresh your memory later on",
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
      },
      {
        point:
          "Includes your notes, branding, disclaimers, and a breakdown all decisions",
      },
      {
        point: "Easily export & share with your clients",
        detail:
          "⏳ Coming Soon: Send reports client in a click, or let them view their classifications right in HTS Hero",
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
          "Immediately see the notes that might impact your classification",
        detail: "General, Section, Chapter, Subheading, etc...",
      },
      {
        point: "Helps you find the details of HTS references",
        detail: `👉 "See heading 9902.22.84" 👉 "Articles of heading 4601"`,
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
    name: "Finds CROSS Rulings",
    points: [
      {
        point: "Automatically searches CROSS rulings for you",
        detail: "Based on the item description & final code",
      },
      {
        point: "~10 minutes saved",
        detail: "per classification",
        isKey: true,
      },
    ],
    svg: <SearchSVG color="#40C969" size={7} viewBox="0 0 24 24" />,
  },
  {
    name: "HTS Explorer",
    points: [
      {
        point: "A 'clickable' HTS explorer tailor-made for the broker workflow",
        detail:
          "Navigate the entire HTS without the downloads and initial search, just click",
      },
      {
        point:
          "A built in PDF viewer lets see everything you need in a single tab",
      },
    ],
    svg: <CursorSVG color="#40C969" size={7} viewBox="0 0 24 24" />,
  },
];

const FeaturesListicle = () => {
  const featuresEndRef = useRef<null>(null);
  const [featureSelected, setFeatureSelected] = useState<string>(
    features[0].name
  );
  const [hasClicked, setHasClicked] = useState<boolean>(false);

  return (
    <section className="py-24 bg-base-100" id="features">
      <div className="max-w-5xl mx-auto">
        <div className="text-center max-md:px-8 max-w-5xl mb-8 md:px-12">
          <h2 className="text-white font-extrabold text-4xl md:text-5xl lg:text-6xl tracking-tight mb-5">
            {/* 💡 COPY TIP: Remind visitors about the value of your product. Why do they need it? */}
            The Smarter Way to Classify
          </h2>
          <p className="text-neutral-300 leading-relaxed mb-3 lg:text-lg">
            {/* 💡 COPY TIP: Explain how your product delivers what you promise in the headline. */}
            HTS Hero finds the information you need to classify and generates
            polished reports.
          </p>
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
              className="leading-relaxed flex flex-col gap-4 max-w-3xl animate-opacity"
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
        </div>
      </div>
      {/* Just used to know it's the end of the autoscroll feature (optional, see useEffect) */}
      <p className="opacity-0" ref={featuresEndRef}></p>
    </section>
  );
};

export default FeaturesListicle;
