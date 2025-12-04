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
  media: { src: string; alt: string; type: "image" | "video" };
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
    media: {
      src: "/get-candidates.mp4",
      alt: "See Candidate HS Headings",
      type: "video",
    },
  },
  {
    name: "Get Best-Fit Analysis for All Candidates",
    points: [
      {
        point: "Provides a GRI Analysis of Candidates at Every Level",
      },
      {
        point: "Helps you Quickly Determine the Best Candidate",
      },
      {
        point: "Easily Add Your Own Notes",
      },
      {
        point: "~10 minutes saved",
        detail: "per classification",
        isKey: true,
      },
    ],
    svg: <LightBulbSVG color="primary" size={8} viewBox="0 0 24 24" />,
    media: {
      src: "/candidate-analysis.png",
      alt: "Analyze candidates and choose confidently",
      type: "image",
    },
  },
  {
    name: "See The Latest Tariffs for Any Import",
    points: [
      {
        point: "Discover ways to save with exemptions & trade programs",
      },
      {
        point:
          "Get notified when any of your imports are affected by new tariffs",
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
    media: {
      src: "/tariffs-hero.mp4",
      alt: "Tariff insights and savings",
      type: "video",
    },
  },
  {
    name: "Quickly Validate Against Government Rulings",
    points: [
      {
        point: "See CROSS Rulings Related to your Item",
      },
      {
        point: "Find Out If CBP Agrees with your Classification",
      },
      {
        point: "~10 minutes saved",
        detail: "per classification",
        isKey: true,
      },
    ],
    svg: <ScaleSVG color="primary" size={8} viewBox="0 0 24 24" />,
    media: {
      src: "/cross-rulings.mp4",
      alt: "Relevant CROSS rulings",
      type: "video",
    },
  },
  {
    name: "Generate Branded Reports, In One Click",
    points: [
      {
        point: "Generate polished classification reports, in a single click",
      },
      {
        point:
          "Automatically includes your notes, branding, disclaimers, contact info, & more",
      },
      {
        point: "Effortless record keeping and sharing with clients",
      },
      {
        point: "~20 minutes saved",
        detail: "per classification",
        isKey: true,
      },
    ],
    svg: <DocumentTextSVG color="primary" size={8} viewBox="0 0 24 24" />,
    media: {
      src: "/report.png",
      alt: "One-click classification reports",
      type: "image",
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
    media: {
      src: "/teams.png",
      alt: "One-click classification reports",
      type: "image",
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
                      {feature.media.type === "image" ? (
                        <Image
                          src={feature.media.src}
                          alt={feature.media.alt}
                          width={900}
                          height={600}
                          className="w-full max-w-2xl rounded-md object-cover"
                        />
                      ) : (
                        <video
                          src={feature.media.src}
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="w-full max-w-2xl rounded-md object-cover"
                          aria-label={feature.media.alt}
                        />
                      )}
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
