"use client";

import { useState } from "react";
import Link from "next/link";
import { Media } from "./Media";
import { AccordionItem } from "./AccordionItem";
import { FeatureI } from "../interfaces/ui";

interface Props {
  features: FeatureI[];
}

// A component to display 2 to 5 features in an accordion.
// By default, the first feature is selected. When a feature is clicked, the others are closed.
const FeaturesAccordion = ({ features }: Props) => {
  const [featureSelected, setFeatureSelected] = useState<number | null>(0);

  return (
    <section
      className="px-8 py-24 md:py-32 space-y-24 md:space-y-32 max-w-7xl mx-auto bg-base-100 "
      id="features"
    >
      <div className="px-3">
        <div className="flex flex-col gap-5 mb-6 md:mb-12">
          <h2 className="text-white font-extrabold text-4xl md:text-5xl lg:text-6xl tracking-tight">
            Your Classification Sidekick
          </h2>
          <p className="pl-2 text-base-content">
            HTS Hero finds the information you need to classify and generates
            polished client reports.
          </p>
          <Link className="btn btn-primary btn-wide" href={"/app"}>
            Try it now!
          </Link>
        </div>
        <div className="w-full flex flex-col md:flex-row gap-12 md:gap-24">
          <div className="w-full grid grid-cols-1 items-stretch gap-8 sm:gap-12 lg:gap-20">
            <ul className="w-full lg:flex lg:flex-col lg:gap-5">
              {features.map((feature, i) => (
                <AccordionItem
                  key={feature.title}
                  index={i}
                  features={features}
                  feature={feature}
                  isOpen={featureSelected === i}
                  setFeatureSelected={() => {
                    if (featureSelected === i) {
                      setFeatureSelected(null);
                    } else {
                      setFeatureSelected(i);
                    }
                  }}
                />
              ))}
            </ul>

            {/* <div className="w-full h-fit justify-center self-center hidden lg:flex lg:col-span-2">
              <Media
                feature={features[featureSelected]}
                key={featureSelected}
              />
            </div> */}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesAccordion;
