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
import { RegistrationTrigger } from "../libs/early-registration";
import config from "@/config";
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
          "Fetches the details of references with missing links in the HTS",
        detail: `e.g. "See heading 9902.22.84" or "Articles of heading 4601"`,
      },
      {
        point:
          "Can summarize complex or lengthy passages for easy understanding",
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
        point: "Fetches CROSS rulings related to the item you're classifying",
      },
      {
        point:
          "Includes them as attachments for your classification report, if desired",
      },
      { point: "~20 min saved", detail: "per classification", isKey: true },
    ],
    svg: <CheckBadgeSVG color="#40C969" size={7} viewBox="0 0 24 24" />,
  },
  {
    name: "Match Suggestions",
    points: [
      {
        point:
          "Quickly finds the most likely matches at each classification level",
      },
      {
        point:
          "Completes classifications for you and prepares them for your review",
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
        point: "A brand new HTS explorer tailor-made for experts",
      },
      {
        point:
          "Comprehensive product descriptions from clients without all the back and forth",
      },
      {
        point: "Automatic record keeping of all your classifications",
      },
      {
        point:
          "Ability to save & favorite CROSS rulings and notes for quick reference when needed",
      },
      // {
      //   point:
      //     "Our mission is to save you hours of time and frustration on classification",
      //   isKey: true,
      // },
    ],
    svg: <MoreSVG color="#40C969" size={7} viewBox="0 0 24 24" />,
  },
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
      <div className="max-w-3xl mx-auto">
        <div className="bg-base-100 max-md:px-8 max-w-3xl mb-8">
          <h2 className="font-extrabold text-4xl md:text-5xl tracking-tight mb-5">
            {/* 💡 COPY TIP: Remind visitors about the value of your product. Why do they need it? */}
            Supercharge your Classifications
          </h2>
          <div className="text-base-content/80 leading-relaxed mb-3 lg:text-lg">
            {/* 💡 COPY TIP: Explain how your product delivers what you promise in the headline. */}
            Forget fetching notes, references, and CROSS rulings or manually
            generating reports for your clients. HTS Hero provides you with the
            information you need to classify quickly with confidence.
            {/* at each step of classification */}
            {/* and suggests the best matches based on the GRI. This greatly reduces
            classification time and labor, freeing you to focus on other parts
            of your business. */}
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
                  ? "bg-[#40C969]/20 scale-[1.03] shadow-lg shadow-[#40C969]/70"
                  : "bg-neutral-100/10 hover:shadow-[#40C969]/50 hover:shadow-lg hover:scale-[1.03]"
              )}
            >
              <span
                className={`duration-100 shrink-0 ${
                  featureSelected === feature.name
                    ? "text-[#40C969] animate-pulse"
                    : "text-base-content/60 group-hover:text-white"
                }`}
              >
                {feature.svg}
              </span>
              <p
                className={`font-semibold text-sm text-center ${
                  featureSelected === feature.name
                    ? "text-[#40C969] animate-pulse"
                    : "text-base-content/60 group-hover:text-white"
                }`}
              >
                {feature.name}
              </p>
            </div>
          ))}
        </div>
        <div className="bg-black max-w-3xl mx-auto">
          <div className="flex flex-col md:flex-row justify-center md:justify-start md:items-center gap-12">
            <div
              className="text-base-content/80 leading-relaxed space-y-4 max-w-3xl animate-opacity"
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
          <button
            className="mt-8 btn btn-primary bg-gray-200 text-black hover:text-white btn-wide rounded-md"
            onClick={() => {
              const trigger =
                featureSelected === "Notes & References"
                  ? RegistrationTrigger.feature_notes
                  : featureSelected === "CROSS Rulings"
                  ? RegistrationTrigger.feature_cross_rulings
                  : featureSelected === "Match Suggestions"
                  ? RegistrationTrigger.feature_match_suggestions
                  : featureSelected === "Product Analysis"
                  ? RegistrationTrigger.feature_product_analysis
                  : featureSelected === "Report Generation"
                  ? RegistrationTrigger.feature_report_generation
                  : RegistrationTrigger.feature_more_features;
              setIsRegisterOpen(true);
              setRegistrationTrigger(trigger);
            }}
          >
            Try it free!
            {/* Get {config.appName} */}
          </button>
        </div>
      </div>
      {/* Just used to know it's the end of the autoscroll feature (optional, see useEffect) */}
      <p className="opacity-0" ref={featuresEndRef}></p>
    </section>
  );
};

export default FeaturesListicle;
