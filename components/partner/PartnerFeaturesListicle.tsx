"use client";

import { useState, useRef } from "react";
import type { JSX } from "react";
import { FeaturePoint, FeaturePoints } from "../FeaturePoints";
import { classNames } from "../../utilities/style";
import LightningSVG from "../svg/LightningSVG";
import Link from "next/link";
import StarSVG from "../svg/StarSVG";
import FunnelSVG from "../svg/FunnelSVG";
import UpRightArrowSVG from "../svg/UpTrendSVG";
import RocketSVG from "../svg/RocketSVG";

const features: {
  name: string;
  points: FeaturePoint[];
  svg: JSX.Element;
}[] = [
  {
    name: "Stand Out from the Crowd",
    points: [
      {
        point:
          "Offer an affordable, modern, & fast self-classification tool your clients will love.",
      },
      {
        point: "Supercharge your internal classifications",
      },
      {
        point: "Free up time to focus on other parts of the business",
      },
      {
        point: "Provide a premium experience that builds trust",
      },
      {
        point: "Result: More clients & more upsell potential",
        isKey: true,
      },
    ],
    svg: <StarSVG color="primary" size={7} viewBox="0 0 24 24" />,
  },
  {
    name: "Capture More Clients",
    points: [
      {
        point:
          "A budget option sells unsure prospects & lets you demonstrate value",
      },
      {
        point:
          "Self-Service + Quicker Internal Classifications = More Clients & Higher Margins",
      },
      {
        point: "Result: More clients & more upsell potential",
        isKey: true,
      },
    ],
    svg: <FunnelSVG color="primary" size={7} viewBox="0 0 24 24" />,
  },
  {
    name: "Encourage Upsells",
    points: [
      {
        point:
          "Together, we provide a premium experience that establishes trust",
      },
      {
        point: "HTS Hero then highlights other problems they might have",
      },
      {
        point: "And your offerings that solve those problems are a click away",
      },
      {
        point: "Result: More upsells",
        isKey: true,
      },
    ],
    svg: <UpRightArrowSVG color="primary" size={7} viewBox="0 0 24 24" />,
  },
  {
    name: "Reduce your Workload",
    points: [
      {
        point:
          "We handle everything from product analysis to report generation",
        detail:
          "But provide control & customization over each step of the process",
      },
      {
        point:
          "We promote your other services to help you land upsells beyond classification",
      },
      {
        point: "Result: More time to build your business",
        isKey: true,
      },
    ],
    svg: <RocketSVG color="primary" size={7} viewBox="0 0 24 24" />,
  },
  {
    name: "Set Up in Minutes",
    points: [
      {
        point: "We create a custom link for your clients to use",
      },
      {
        point:
          "They sign up in a single click, and are linked to your business",
      },
      {
        point: "We handle the training, tech, and support",
      },
      {
        point: "You customise the experience for your brand & business",
      },
      {
        point: "Result: Client-ready in minutes",
        isKey: true,
      },
    ],
    svg: <LightningSVG color="primary" size={7} viewBox="0 0 24 24" />,
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
      <div className="max-w-5xl mx-auto">
        <div className="bg-base-100 max-md:px-8 max-w-5xl mb-8 md:px-12">
          <h2 className="text-white font-extrabold text-4xl md:text-5xl lg:text-6xl tracking-tight mb-5">
            {/* 💡 COPY TIP: Remind visitors about the value of your product. Why do they need it? */}
            {/* Grow Revenue via Classifications */}
            {/* Grow your Offerings, Not your Workload */}
            {/* Service Clients without Lifting a Finger */}
            {/* HTS Code that Work While You Sleep */}
            More Classifications, Less Work
          </h2>
          <div className="text-neutral-300 leading-relaxed mb-3 lg:text-lg">
            {/* 💡 COPY TIP: Explain how your product delivers what you promise in the headline. */}
            Affordable low-touch classifications and a premium experience that
            builds trust & drives upsells.
          </div>
        </div>
      </div>

      <div className="mx-6 md:mx-12">
        <div className="grid grid-cols-3 md:flex justify-between px-2 gap-4 max-w-4xl mx-auto mb-8">
          {features.map((feature) => (
            <div
              key={feature.name}
              onClick={() => {
                if (!hasClicked) setHasClicked(true);
                setFeatureSelected(feature.name);
              }}
              className={classNames(
                featureSelected === feature.name
                  ? "border-2 border-primary"
                  : "hover:scale-[1.03] cursor-pointer",
                "flex flex-col items-center justify-center gap-3 p-2 duration-100 group rounded-lg border-2 border-transparent"
              )}
            >
              <span
                className={`duration-100 shrink-0 ${
                  featureSelected === feature.name
                    ? "text-primary"
                    : "text-base-content/60 group-hover:text-white"
                }`}
              >
                {feature.svg}
              </span>
              <p
                className={`font-semibold text-sm text-center ${
                  featureSelected === feature.name
                    ? "text-primary"
                    : "text-base-content/60 group-hover:text-white"
                }`}
              >
                {feature.name}
              </p>
            </div>
          ))}
        </div>
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row justify-center md:justify-start md:items-center gap-12">
            <div
              className="leading-relaxed space-y-4 max-w-3xl animate-opacity"
              key={featureSelected}
            >
              <h3 className="text-white font-semibold text-lg">
                {features.find((f) => f.name === featureSelected)["name"]}
              </h3>

              <FeaturePoints
                points={
                  features.find((f) => f.name === featureSelected)["points"]
                }
              />
            </div>
          </div>
          <Link
            className="mt-8 btn btn-primary btn-wide"
            href={"/about/partner#pricing"}
          >
            Find out More
          </Link>
        </div>
      </div>
      {/* Just used to know it's the end of the autoscroll feature (optional, see useEffect) */}
      <p className="opacity-0" ref={featuresEndRef}></p>
    </section>
  );
};

export default FeaturesListicle;
