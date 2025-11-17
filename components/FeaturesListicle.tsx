"use client";

import type { JSX } from "react";
import Image from "next/image";
import { FeaturePoint, FeaturePoints } from "./FeaturePoints";
import LightBulbSVG from "./svg/LightBulbSVG";
import DocumentTextSVG from "./svg/DocumentTextSVG";
import LightningSVG from "./svg/LightningSVG";
import ScaleSVG from "./svg/Scale";
import PuzzlePieceSVG from "./svg/PuzzlePieceSVG";
import UsersSVG from "./svg/UsersSVG";

const features: {
  name: string;
  points: FeaturePoint[];
  svg: JSX.Element;
  image: { src: string; alt: string };
}[] = [
  {
    name: "Finds Candidates",
    points: [
      {
        point:
          "Jump-start classifications instead of starting from scratch every time",
      },
      {
        point: "Get HS headings for any item in seconds",
      },
      {
        point: "Discover headings you might have missed",
      },
      {
        point: "Easily find & apply your own",
      },
      {
        point: "~10 minutes saved",
        detail: "per classification",
        isKey: true,
      },
    ],
    svg: <LightningSVG color="#facc15" fill size={8} viewBox="0 0 24 24" />,
    image: { src: "/candidates.png", alt: "Candidates HS headings" },
  },
  {
    name: "Analyzes Options",
    points: [
      {
        point: "Provides a GRI analysis of candidates at every level",
      },
      {
        point: "Helps you quickly find the best candidate",
      },
      {
        point: "Lets you add your own notes for any decision",
        detail: "These are automatically included in your reports",
      },
      {
        point: "~10 minutes saved",
        detail: "per classification",
        isKey: true,
      },
    ],
    svg: <LightBulbSVG color="#facc15" fill size={8} viewBox="0 0 24 24" />,
    image: {
      src: "/analysis.png",
      alt: "Analyze candidates and choose confidently",
    },
  },
  {
    name: "Searches CROSS Rulings",
    points: [
      {
        point: "Automatically searches CROSS rulings for you",
      },
      {
        point:
          "Lets you quickly see if you're on the right track by seeing relevant rulings",
      },
      {
        point: "~10 minutes saved",
        detail: "per classification",
        isKey: true,
      },
    ],
    svg: <ScaleSVG color="#facc15" size={8} fill viewBox="0 0 24 24" />,
    image: { src: "/cross.png", alt: "Relevant CROSS rulings" },
  },
  {
    name: "Finds & Calculates Tariffs",
    points: [
      {
        point: "See the latest tariffs for any import from any country",
      },
      {
        point: "Discover ways to save with exemptions & trade programs",
      },
      {
        point: "Constantly updated with the latest tariff annoucements",
      },
      {
        point: "~20 minutes saved",
        detail: "per classification",
        isKey: true,
      },
    ],
    svg: <PuzzlePieceSVG color="#facc15" fill size={8} viewBox="0 0 24 24" />,
    image: {
      src: "/tariffs.png",
      alt: "Tariff insights and savings",
    },
  },
  {
    name: "Creates Branded Reports",
    points: [
      {
        point: "Generate classification reports, in a single click",
      },
      {
        point:
          "Automatically includes your notes, branding, disclaimers, contact info, & more",
      },
      {
        point: "Easily export & share with your clients",
      },
      {
        point: "~20 minutes saved",
        detail: "per classification",
        isKey: true,
      },
    ],
    svg: <DocumentTextSVG color="#facc15" size={8} viewBox="0 0 24 24" />,
    image: {
      src: "/report.png",
      alt: "One-click classification reports",
    },
  },
  {
    name: "A Collaborative Workspace for Your Team",
    points: [
      {
        point: "Collaborate on classifications",
      },
      {
        point: "Keep track of your teams progress",
      },
      {
        point: "Review & approve your teams classifications",
      },
      {
        point: "Search by description, status, importer, etc...",
      },
      {
        point: "Quicker Classifications, Less Mistakes",
        isKey: true,
      },
    ],
    svg: <UsersSVG color="#facc15" size={8} fill viewBox="0 0 24 24" />,
    image: {
      src: "/teams.png",
      alt: "One-click classification reports",
    },
  },
];

const FeaturesListicle = () => {
  return (
    <section className="py-24 bg-base-100" id="features">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-md:px-8 mb-12 md:px-12">
          <h2 className="text-white font-black text-4xl md:text-5xl lg:text-6xl tracking-tight mb-5">
            The <span className="text-yellow-400">Smarter</span> Way to Classify
          </h2>
          <p className="text-neutral-300 leading-relaxed mb-3 lg:text-lg">
            HTS Hero automates the time-consuming & tedious parts of
            classification
          </p>
        </div>
      </div>

      <div className="px-6 md:px-12 max-w-6xl mx-auto">
        <div className="flex flex-col gap-10 md:gap-14">
          {features.map((feature, index) => {
            const mediaLeft = index % 2 === 1;
            return (
              <article key={feature.name} className="py-6 md:py-10">
                <div
                  className={`grid grid-cols-1 items-center gap-8 lg:gap-16 lg:grid-cols-[1fr_1fr]`}
                >
                  <div className={`${mediaLeft ? "lg:order-2" : "lg:order-1"}`}>
                    <div className="flex items-center gap-3 mb-8">
                      <span className="text-primary">{feature.svg}</span>
                      <h3 className="text-white text-2xl md:text-4xl font-extrabold tracking-tight">
                        {feature.name}
                      </h3>
                    </div>
                    {/* <p className="text-neutral-300 mb-6 md:mb-8">
                      {feature.subtitle}
                    </p> */}
                    <FeaturePoints points={feature.points} />
                  </div>
                  <div className={`${mediaLeft ? "lg:order-1" : "lg:order-2"}`}>
                    <div className="w-full h-full flex justify-center p-4 bg-primary rounded-2xl md:rounded-3xl border-2 border-gray-700">
                      <Image
                        src={feature.image.src}
                        alt={feature.image.alt}
                        width={900}
                        height={600}
                        className="w-full max-w-2xl rounded-md object-cover"
                      />
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesListicle;
