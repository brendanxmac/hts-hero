"use client";

import type { JSX } from "react";
import Image from "next/image";
import { FeaturePoint, FeaturePoints } from "./FeaturePoints";
import LightBulbSVG from "./svg/LightBulbSVG";
import DocumentCheckSVG from "./svg/DocumentCheckSVG";
import LightningSVG from "./svg/LightningSVG";
import ScaleSVG from "./svg/Scale";
import PuzzlePieceSVG from "./svg/PuzzlePieceSVG";

const features: {
  name: string;
  subtitle: string;
  points: FeaturePoint[];
  svg: JSX.Element;
  image: { src: string; alt: string };
}[] = [
  {
    name: "Finds Heading Candidates",
    subtitle:
      "Enter a description and instantly see HS headings that jump‑start your work.",
    points: [
      {
        point:
          "Enter an item description and get suitable HS headings in seconds",
      },
      {
        point: "Jump-start classifications instead of starting from scratch",
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
    svg: <LightningSVG color="#40C969" size={7} viewBox="0 0 24 24" />,
    image: { src: "/candidates.png", alt: "Candidates HS headings" },
  },
  {
    name: "Analyzes Candidates",
    subtitle:
      "Compare candidates with GRI analysis to select the best option confidently.",
    points: [
      {
        point: "Provides a GRI analysis of candidates at every level",
      },
      {
        point: "Helps you quickly find the best candidate",
      },
      {
        point: "Add your own notes for any decision",
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
    image: {
      src: "/analysis.png",
      alt: "Analyze candidates and choose confidently",
    },
  },
  {
    name: "Finds CROSS Rulings",
    subtitle:
      "Surface relevant CROSS rulings based on your description and final code.",
    points: [
      {
        point: "Automatically searches CROSS rulings for you",
        detail: "Based on the item description & final code",
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
    svg: <ScaleSVG color="#40C969" size={7} viewBox="0 0 24 24" />,
    image: { src: "/cross.png", alt: "Relevant CROSS rulings" },
  },
  {
    name: "Fetches Tariffs",
    subtitle:
      "See the latest duty rates, exemptions, and savings opportunities at a glance.",
    points: [
      {
        point: "See the latest tariffs for any import from any country",
      },
      {
        point: "Discover ways to save",
        detail: "Explore & apply exemptions & trade programs",
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
    svg: <PuzzlePieceSVG color="#40C969" size={7} viewBox="0 0 24 24" />,
    image: {
      src: "/tariffs.png",
      alt: "Tariff insights and savings",
    },
  },
  {
    name: "Generates Branded Reports",
    subtitle: "Create polished client-ready reports in a single click.",
    points: [
      {
        point: "Generate classification reports, in a single click",
      },
      {
        point:
          "Automatically includes notes, branding, disclaimers, classifier, & client",
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
    svg: <DocumentCheckSVG color="#40C969" size={7} viewBox="0 0 24 24" />,
    image: {
      src: "/report.png",
      alt: "One-click classification reports",
    },
  },
  // {
  //   name: "Fetches Notes",
  //   points: [
  //     {
  //       point:
  //         "Immediately see the notes that might impact your classification",
  //       detail: "General, Section, Chapter, Subheading, etc...",
  //     },
  //     {
  //       point: "Helps you find the details of HTS references",
  //       detail: `👉 "See heading 9902.22.84" 👉 "Articles of heading 4601"`,
  //     },
  //     {
  //       point: "~10 minutes saved",
  //       detail: "per classification",
  //       isKey: true,
  //     },
  //   ],
  //   svg: <DocumentSearchSVG color="#40C969" size={7} viewBox="0 0 24 24" />,
  // },
];

const FeaturesListicle = () => {
  return (
    <section className="py-24 bg-base-100" id="features">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-md:px-8 mb-12 md:px-12">
          <h2 className="text-white font-black text-4xl md:text-5xl lg:text-6xl tracking-tight mb-5">
            The Smarter Way to Classify
          </h2>
          <p className="text-neutral-300 leading-relaxed mb-3 lg:text-lg">
            HTS Hero automates the time-consuming & tedious parts of
            classification
          </p>
        </div>
      </div>

      <div className="px-6 md:px-12 max-w-6xl mx-auto">
        <div className="flex flex-col gap-10 md:gap-12">
          {features.map((feature, index) => {
            // const mediaLeft = index % 2 === 1;
            return (
              <article
                key={feature.name}
                className="rounded-2xl md:rounded-3xl bg-base-200 border border-base-content/10 p-6 md:p-10"
              >
                <div
                  className={`grid grid-cols-1 items-center gap-8 lg:gap-12 lg:grid-cols-[1fr_1fr]`}
                >
                  <div>
                    <div className="flex items-center gap-3 mb-8">
                      <span className="text-primary">{feature.svg}</span>
                      <h3 className="text-white text-2xl md:text-3xl font-extrabold tracking-tight">
                        {feature.name}
                      </h3>
                    </div>
                    {/* <p className="text-neutral-300 mb-6 md:mb-8">
                      {feature.subtitle}
                    </p> */}
                    <FeaturePoints points={feature.points} />
                  </div>
                  <div>
                    <div className="w-full h-full flex justify-center">
                      <Image
                        src={feature.image.src}
                        alt={feature.image.alt}
                        width={900}
                        height={600}
                        className="w-full max-w-2xl rounded-2xl md:rounded-3xl border-2 border-white/10 object-cover"
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
