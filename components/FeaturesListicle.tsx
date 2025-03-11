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

const features: {
  name: string;
  points: FeaturePoint[];
  svg: JSX.Element;
}[] = [
  {
    name: "Product Analysis",
    points: [
      {
        point:
          "Product Composition Analysis: The % of each element of the product",
      },
      {
        point: " Essential Character Analysis: GRI 3(b)",
      },
      {
        point: "Primary Use Analysis: Additional US Rules",
      },
      { point: "Time saved: ~10 minutes", isKey: true },
    ],
    svg: <PuzzlePieceSVG color="#40C969" size={8} viewBox="0 0 24 24" />,
  },
  {
    name: "Finding CROSS Rulings",
    points: [
      {
        point:
          "Automatically get CROSS Rulings relevant to your classification",
      },
      {
        point:
          "No more searching through pages of rulings on an outdated website",
      },
      {
        point:
          "Presented on the same website as your other classification information",
      },
      { point: "Time saved: ~30 minutes", isKey: true },
    ],
    svg: <CheckBadgeSVG color="#40C969" size={8} viewBox="0 0 24 24" />,
  },
  {
    name: "Finding Notes & References",
    points: [
      {
        point:
          "We find any legally binding notes that can impact a classification for you",
      },
      {
        point: "Includes: General, Section, Chapter, Subheading, and more",
      },
      {
        point:
          "See the details of references like 'See heading 9902.22.84' without lifting a finger",
      },
      {
        point: "Minimize switching tabs and searching around",
      },
      { point: "Time saved: ~10 minutes", isKey: true },
    ],
    svg: <DocumentSearchSVG color="#40C969" size={8} viewBox="0 0 24 24" />,
  },
  {
    name: "Best Match Suggestions",
    points: [
      { point: "Most likely matches at each classification level" },
      {
        point: "Full classifications ready for review",
      },
      {
        point:
          "Includes reasoning for each choice utilizing the GRI & Additional US Rules",
      },
      { point: "Time saved: ~10 minutes", isKey: true },
    ],
    svg: <LightBulbSVG color="#40C969" size={8} viewBox="0 0 24 24" />,
  },
  {
    name: "Generating Reports",
    points: [
      {
        point: "Automatically generate classification reports for your clients",
      },
      {
        point:
          "Just like CROSS rulings, all reasoning and a detailed break down is included",
      },
      {
        point:
          "Pick and choose which auto-generated reasoning to include, and quickly edit as needed",
      },
      { point: "Time saved: ~30 minutes", isKey: true },
    ],
    svg: <DocumentCheckSVG color="#40C969" size={8} viewBox="0 0 24 24" />,
  },
  {
    name: "And Much More",
    points: [
      {
        point:
          "Kick off classifications ahead of time and come back to review when ready",
      },
      {
        point:
          "Step by Step Mode: Classify step by step with helpful automations",
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
        point: "Try it for free to see the benefits for yourself!",
        isKey: true,
      },
    ],
    svg: <MoreSVG color="#40C969" size={8} viewBox="0 0 24 24" />,
  },
];

// A list of features with a listicle style.
// - Click on a feature to display its description.
// - Good to use when multiples features are available.
// - Autoscroll the list of features (optional).
const FeaturesListicle = () => {
  const featuresEndRef = useRef<null>(null);
  const [featureSelected, setFeatureSelected] = useState<string>(
    features[0].name
  );
  const [hasClicked, setHasClicked] = useState<boolean>(false);

  // (Optional) Autoscroll the list of features so user know it's interactive.
  // Stop scrolling when user scroll after the featuresEndRef element (end of section)
  // emove useEffect is not needed.
  useEffect(() => {
    const interval = setInterval(() => {
      if (!hasClicked) {
        const index = features.findIndex(
          (feature) => feature.name === featureSelected
        );
        const nextIndex = (index + 1) % features.length;
        setFeatureSelected(features[nextIndex].name);
      }
    }, 5000);

    try {
      // stop the interval when the user scroll after the featuresRef element
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            console.log("STOP AUTO CHANGE");
            clearInterval(interval);
          }
        },
        {
          root: null,
          rootMargin: "0px",
          threshold: 0.5,
        }
      );
      if (featuresEndRef.current) {
        observer.observe(featuresEndRef.current);
      }
    } catch (e) {
      console.error(e);
    }

    return () => clearInterval(interval);
  }, [featureSelected, hasClicked]);

  return (
    <section className="py-24" id="features">
      <div className="max-w-3xl mx-auto">
        <div className="bg-base-100 max-md:px-8 max-w-3xl">
          <h2 className="font-extrabold text-4xl md:text-5xl tracking-tight mb-8">
            {/* 💡 COPY TIP: Remind visitors about the value of your product. Why do they need it? */}
            {/* It's Like Autocomplete for HTS Classifications */}
            {/* Streamline classifications with Intelligent Automation */}
            {/* Classify with Autocomplete*/}
            {/* We Automate the Boring Stuff */}
            Automate the Annoying Bits
          </h2>
          <div className="text-base-content/80 leading-relaxed mb-8 lg:text-lg">
            {/* 💡 COPY TIP: Explain how your product delivers what you promise in the headline. */}
            Easily explore the entire HTS, See related CROSS rulings, notes, and
            references immediately, in the same tab, and get intelligent auto
            suggestions for a products essential nature, use, and more. Think
            autocomplete for classification, designed specially for HTS Experts.
            Spend your time on the parts that require expert jugement, let HTS
            Hero handle the rest.
          </div>
        </div>
      </div>

      <div>
        <div className="grid grid-cols-3 lg:flex justify-between  gap-4 max-w-3xl mx-auto mb-8">
          {features.map((feature) => (
            <div
              key={feature.name}
              onClick={() => {
                if (!hasClicked) setHasClicked(true);
                setFeatureSelected(feature.name);
              }}
              className={`flex flex-col items-center justify-center gap-3 select-none cursor-pointer p-2 duration-200 group`}
            >
              <span
                className={`duration-100 shrink-0 ${
                  featureSelected === feature.name
                    ? "text-[#40C969]"
                    : "text-base-content/30 group-hover:text-gray-300"
                }`}
              >
                {feature.svg}
              </span>
              <p
                className={`font-semibold text-sm text-center ${
                  featureSelected === feature.name
                    ? "text-[#40C969]"
                    : "text-base-content/50 group-hover:text-gray-300"
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
              className="text-base-content/80 leading-relaxed space-y-4 px-12 md:px-0 max-w-3xl animate-opacity"
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
