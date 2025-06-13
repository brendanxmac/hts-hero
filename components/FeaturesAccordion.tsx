"use client";

import { useState } from "react";
import type { JSX } from "react";
import Link from "next/link";
import { Media } from "./Media";
import { classifyFeatures } from "../constants/features";
import { AccordionItem } from "./AccordionItem";

export interface Feature {
  title: string; // The title of the feature
  description: JSX.Element | string; // The description of the feature (when clicked)
  mediaType?: "video" | "image"; // The type of media (video or image)
  mediaPath?: string; // The path to the media (for better SEO, try to use a local path)
  mediaFormat?: string; // The format of the media (if type is 'video')
  altText?: string; // The alt text of the image (if type is 'image')
  titleSvg?: JSX.Element;
}

// A component to display 2 to 5 features in an accordion.
// By default, the first feature is selected. When a feature is clicked, the others are closed.
const FeaturesAccordion = () => {
  const [featureSelected, setFeatureSelected] = useState<number>(0);

  return (
    <section
      className="px-6 lg:px-0 py-24 md:py-32 space-y-24 md:space-y-32 max-w-7xl mx-auto bg-base-100 "
      id="features"
    >
      <div className="px-3">
        <div className="flex flex-col gap-5 mb-6 md:mb-12">
          <h2 className="text-white font-extrabold text-4xl lg:text-6xl tracking-tight">
            Type Description, Get Code
          </h2>
          <p className="pl-2 text-base-content">
            HTS Hero guides you step-by-step to a valid HTS Code for your
            product. <br /> No experience needed, just a clear description.
          </p>
          <Link className="btn btn-primary btn-wide" href={"/app"}>
            Try it now!
          </Link>
        </div>
        <div className=" flex flex-col md:flex-row gap-12 md:gap-24">
          <div className="grid grid-cols-1 items-stretch gap-8 sm:gap-12 xl:grid-cols-2 lg:gap-20">
            <ul className="w-full xl:flex xl:flex-col xl:gap-5">
              {classifyFeatures.map((feature, i) => (
                <AccordionItem
                  key={feature.title}
                  index={i}
                  features={classifyFeatures}
                  feature={feature}
                  isOpen={featureSelected === i}
                  setFeatureSelected={() => setFeatureSelected(i)}
                />
              ))}
            </ul>

            <div className="w-full h-fit justify-center self-center hidden xl:flex">
              <Media
                feature={classifyFeatures[featureSelected]}
                key={featureSelected}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesAccordion;
