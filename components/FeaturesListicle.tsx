"use client";

import { useState, useEffect, useRef } from "react";
import type { JSX } from "react";
import PuzzlePieceSVG from "./svg/PuzzlePieceSVG";
import { FeaturePoint, FeaturePoints } from "./FeaturePoints";
import CheckBadgeSVG from "./svg/CheckBadgeSVG";
import DocumentSearchSVG from "./svg/DocumentSearchSVG";
import LightBulbSVG from "./svg/LightBulbSVG";
import DocumentCheckSVG from "./svg/DocumentCheckSVG";
import MoreSVG from "./svg/MoreSVG";
import { classNames } from "../utilities/style";

const features: {
  name: string;
  points: FeaturePoint[];
  svg: JSX.Element;
}[] = [
  {
    name: "Notes & References",
    points: [
      {
        point: "Finds any notes that might impact your classification",
        detail: "General, Section, Chapter, Subheading, etc...",
      },
      {
        point:
          "Fetches details of references that are missing links in the HTS",
        detail: `e.g. "See heading 9902.22.84" or "Articles of heading 4601"`,
      },
      {
        point: "Can sumarize complex passages for easy comprehension",
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
    name: "CROSS Rulings",
    points: [
      {
        point: "Fetches relevant CROSS Rulings for reference",
      },
      {
        point: "Prepares them as attachments for your classification report",
      },
      { point: "~20 min saved", detail: "per classification", isKey: true },
    ],
    svg: <CheckBadgeSVG color="#40C969" size={7} viewBox="0 0 24 24" />,
  },
  {
    name: "Match Suggestions",
    points: [
      {
        point: "Finds the most probable matches at each classification level",
      },
      {
        point: "Completes full classifications ready for your review",
      },
      {
        point:
          "Provides reasoning for each choice based on the GRI & Additional US Rules",
      },
      {
        point: "Up to 30 minutes saved",
        detail: "per classification",
        isKey: true,
      },
    ],
    svg: <LightBulbSVG color="#40C969" size={7} viewBox="0 0 24 24" />,
  },
  {
    name: "Product Analysis",
    points: [
      {
        point: "Composition Analysis",
        // detail: "Finds the ratios of each element of the product",
      },
      {
        point: "Essential Character Analysis",
        // detail: "GRI 3(b)",
      },
      {
        point: "Primary Use Analysis",
        // detail: "Additional US Rules",
      },
      {
        point: "~10 minutes saved",
        detail: "per classification",
        isKey: true,
      },
    ],
    svg: <PuzzlePieceSVG color="#40C969" size={7} viewBox="0 0 24 24" />,
  },
  {
    name: "Report Generation",
    points: [
      {
        point: "Generates classification reports for your clients",
      },
      {
        point:
          "Includes reasoning and a detailed breakdown just like CROSS rulings",
      },
      {
        point: "Lets you easily choose which reasoning should be included",
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
    name: "And Much More",
    points: [
      {
        point:
          "Trigger automated classifications ahead of time, then review when ready",
      },
      {
        point: "Use a brand new HTS explorer tailor made for experts",
      },
      {
        point:
          "Get comprehensive product descriptions from clients without all the back and forth",
      },
      {
        point: "Automatically keep records of all your classifications",
      },
      {
        point:
          "Save & favorite CROSS rulings and notes for quick reference when needed",
      },
      {
        point: "Try it free to see for yourself!",
        isKey: true,
      },
    ],
    svg: <MoreSVG color="#40C969" size={7} viewBox="0 0 24 24" />,
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
      <div className="max-w-3xl mx-auto">
        <div className="bg-base-100 max-md:px-8 max-w-3xl mb-8">
          <h2 className="font-extrabold text-4xl md:text-5xl tracking-tight mb-5">
            {/* 💡 COPY TIP: Remind visitors about the value of your product. Why do they need it? */}
            Supercharge your Classifications
          </h2>
          <div className="text-base-content/80 leading-relaxed mb-3 lg:text-lg">
            {/* 💡 COPY TIP: Explain how your product delivers what you promise in the headline. */}
            HTS Hero automatically fetches the information you need at each
            level of classification and suggests the best matches. It greatly
            reduces classification time by allowing you to focus on making good
            decisions.
          </div>
        </div>
      </div>

      <div className="mx-6">
        <div className="grid grid-cols-3 lg:flex justify-between px-2 gap-4 max-w-3xl mx-auto mb-8">
          {features.map((feature) => (
            <div
              key={feature.name}
              onClick={() => {
                if (!hasClicked) setHasClicked(true);
                setFeatureSelected(feature.name);
              }}
              className={classNames(
                "flex flex-col items-center justify-center gap-3 p-2 duration-100 group rounded-lg",
                featureSelected === feature.name
                  ? "bg-[#40C969]/20 scale-[1.03]"
                  : "bg-neutral-100/10 shadow-md shadow-[#40C969]/30 hover:shadow-[#40C969]/50 hover:scale-[1.03]"
              )}
            >
              <span
                className={`duration-100 shrink-0 ${
                  featureSelected === feature.name
                    ? "text-[#40C969]"
                    : "text-base-content/60 group-hover:text-white"
                }`}
              >
                {feature.svg}
              </span>
              <p
                className={`font-semibold text-sm text-center ${
                  featureSelected === feature.name
                    ? "text-[#40C969]"
                    : "text-base-content/60 group-hover:text-white"
                }`}
              >
                {feature.name}
              </p>
            </div>
          ))}
        </div>
        <div className="bg-black">
          <div className="max-w-3xl mx-auto flex flex-col md:flex-row justify-center md:justify-start md:items-center gap-12">
            <div
              className="text-base-content/80 leading-relaxed space-y-4 px-8 md:px-0 max-w-3xl animate-opacity"
              key={featureSelected}
            >
              <h3 className="font-semibold text-base-content text-lg">
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
