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
    name: "Quickly See Candidates for Any Product",
    points: [
      {
        point: "Jump-Start Classifications with AI Suggestions",
      },
      {
        point: "See HS Heading Suggestions for any Item",
      },
      {
        point: "Discover Headings You Might Have Missed",
      },
      {
        point: "Easily Find & Apply Your Own HS Headings",
      },
      {
        point: "~10 Minutes Saved",
        detail: "per classification",
        isKey: true,
      },
    ],
    svg: <LightningSVG color="primary" size={8} viewBox="0 0 24 24" />,
    image: { src: "/candidates.png", alt: "Candidates HS headings" },
  },
  {
    name: "Get GRI Analysis of All Candidates",
    points: [
      {
        point: "Provides a GRI Analysis of Candidates at Every Level",
      },
      {
        point: "Helps you Quickly Determine the Best Candidate",
      },
      {
        point: "Easily Add Your Own Notes",
        detail: "Which will be included in your reports automatically",
      },
      {
        point: "~10 minutes saved",
        detail: "per classification",
        isKey: true,
      },
    ],
    svg: <LightBulbSVG color="primary" size={8} viewBox="0 0 24 24" />,
    image: {
      src: "/analysis.png",
      alt: "Analyze candidates and choose confidently",
    },
  },
  {
    name: "Discover Relevant CROSS Rulings",
    points: [
      {
        point: "Automatically Finds CROSS Rulings For You",
      },
      {
        point: "Helps You Quickly See If You're On The Right Track",
      },
      {
        point: "~10 minutes saved",
        detail: "per classification",
        isKey: true,
      },
    ],
    svg: <ScaleSVG color="primary" size={8} viewBox="0 0 24 24" />,
    image: { src: "/cross.png", alt: "Relevant CROSS rulings" },
  },
  {
    name: "Generate Client-Ready Advisory Reports",
    points: [
      {
        point: "Generate polished classification reports, in a single click",
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
    svg: <DocumentTextSVG color="primary" size={8} viewBox="0 0 24 24" />,
    image: {
      src: "/report.png",
      alt: "One-click classification reports",
    },
  },
  {
    name: "See The Latest Tariffs for Any Import from Any Country",
    points: [
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
    svg: <PuzzlePieceSVG color="primary" size={8} viewBox="0 0 24 24" />,
    image: {
      src: "/tariffs.png",
      alt: "Tariff insights and savings",
    },
  },
  {
    name: "Collaborate With Your Whole Team",
    points: [
      {
        point: "See, Review, & Approve Each Others Classifications",
      },
      {
        point: "Collaborate on Classifications & Track Progress",
      },
      {
        point:
          "Search for Classifications by Description, Status, Importer, and Classifier",
      },
      {
        point: "Quicker Classifications, Less Mistakes",
        isKey: true,
      },
    ],
    svg: <UsersSVG color="primary" size={8} viewBox="0 0 24 24" />,
    image: {
      src: "/teams.png",
      alt: "One-click classification reports",
    },
  },
];

const FeaturesListicle = () => {
  return (
    <section className="py-24 bg-base-200" id="features">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-md:px-8 mb-12 md:px-12">
          <h2 className="text-base-content font-black text-4xl md:text-5xl lg:text-6xl tracking-tight mb-5">
            The <span className="underline decoration-primary">Smarter</span>{" "}
            Way to Classify
          </h2>
          <p className="text-base-content leading-relaxed mb-3 lg:text-xl">
            Automate the time-consuming & tedious parts of classification
          </p>
        </div>
      </div>

      <div className="px-6 md:px-12 max-w-6xl mx-auto">
        <div className="flex flex-col gap-10 md:gap-14">
          {features.map((feature, index) => {
            const mediaLeft = index % 2 === 1;
            return (
              <div key={feature.name} className="py-6 md:py-10">
                <div
                  className={`grid grid-cols-1 items-center gap-8 lg:gap-16 lg:grid-cols-[1fr_1fr]`}
                >
                  <div
                    className={`order-2 ${mediaLeft ? "lg:order-2" : "lg:order-1"}`}
                  >
                    <div className="flex items-center gap-3 mb-8">
                      <span className="text-primary">{feature.svg}</span>
                      <h3 className="text-base-content text-2xl md:text-4xl font-extrabold tracking-tight">
                        {feature.name}
                      </h3>
                    </div>
                    <FeaturePoints points={feature.points} />
                  </div>
                  <div
                    className={`order-1 ${mediaLeft ? "lg:order-1" : "lg:order-2"}`}
                  >
                    <div className="w-full h-full flex justify-center p-4 bg-gradient-to-br from-primary/80 via-primary/50 to-transparent rounded-2xl md:rounded-3xl border-2 border-primary/20">
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
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesListicle;
