"use client";

import type { JSX } from "react";
import Image from "next/image";
import { FeaturePoint, FeaturePoints } from "./FeaturePoints";
import LightBulbSVG from "./svg/LightBulbSVG";
import LightningSVG from "./svg/LightningSVG";
import RocketSVG from "./svg/RocketSVG";

const features: {
  name: string;
  points: FeaturePoint[];
  svg: JSX.Element;
  image: { src: string; alt: string };
}[] = [
  {
    name: "Check Tariff Rates",
    points: [
      {
        point: "See tariffs rates for any import from ~200 countries",
      },
      {
        point: "Find the country with the best import rate",
      },
      {
        point: "Compare multiple countries at once",
      },
      {
        point: "Automatically applies tariff stacking rules",
      },
      // {
      //   point: "~10 minutes saved",
      //   detail: "per classification",
      //   isKey: true,
      // },
    ],
    svg: <LightningSVG color="#facc15" size={7} viewBox="0 0 24 24" />,
    image: { src: "/tariffs.png", alt: "Check Tariff Rates" },
  },
  {
    name: "Find Savings",
    points: [
      {
        point: "See all the tariff exemptions that might apply",
      },
      {
        point: "Apply free trade programs you may be eligible for",
      },
    ],
    svg: <RocketSVG color="#facc15" size={7} viewBox="0 0 24 24" />,
    image: {
      src: "/finds-savings.png",
      alt: "Finds Savings",
    },
  },
  {
    name: "Avoid Surprises",
    points: [
      {
        point:
          "Get notified when your imports are affected by new tariff annoucements",
      },
      {
        point: "Monitor your entire product catalog",
      },
      {
        point: "Know the latest tariff rate before your next purchase order",
      },
    ],
    svg: <LightBulbSVG color="#facc15" size={7} viewBox="0 0 24 24" />,
    image: { src: "/avoid-surprises.png", alt: "Avoid Surprises" },
  },
];

const TariffFeaturesListicle = () => {
  return (
    <section className="py-24 bg-base-100" id="features">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-md:px-8 mb-12 md:px-12">
          <h2 className="text-white font-black text-4xl md:text-5xl lg:text-6xl tracking-tight mb-5">
            <span className="text-yellow-400">Conquer</span> Tariff Chaos
          </h2>
          <p className="text-neutral-300 leading-relaxed mb-3 lg:text-lg">
            No more guessing, surprises, or overpaying on tariffs
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

export default TariffFeaturesListicle;
