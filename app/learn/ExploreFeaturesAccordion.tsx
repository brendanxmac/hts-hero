"use client";

import { useState, useRef } from "react";
import type { JSX } from "react";
import Image from "next/image";
import { ChevronRightIcon } from "@heroicons/react/20/solid";
import { ChevronDownIcon } from "@heroicons/react/16/solid";

interface Feature {
  title: string; // The title of the feature
  description: string; // The description of the feature (when clicked)
  points: string[]; // The points of the feature
  type?: "video" | "image"; // The type of media (video or image)
  path?: string; // The path to the media (for better SEO, try to use a local path)
  format?: string; // The format of the media (if type is 'video')
  alt?: string; // The alt text of the image (if type is 'image')
  svg?: JSX.Element;
}

const features = [
  {
    title: "Lightning Fast Search",
    description:
      "Get the results you expect in milliseconds with added context and instantly jump to element details.",
    type: "video",
    path: "/search.mp4",
    format: "video/mp4",
    svg: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="size-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z"
        />
      </svg>
    ),
  },
  {
    title: "Easy Navigation",
    description:
      "Quickly explore the entire HTS level by level, or jump around as needed. Just click.",
    type: "video",
    path: "/navigate.mp4",
    format: "video/mp4",
    svg: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="size-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.042 21.672 13.684 16.6m0 0-2.51 2.225.569-9.47 5.227 7.917-3.286-.672ZM12 2.25V4.5m5.834.166-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243-1.59-1.59"
        />
      </svg>
    ),
  },
  {
    title: "One Tab",
    description:
      "See all of the HTS elements and notes on a single page. Say goodbye to PDF downloads, squinting at tables, and switching tabs",
    type: "video",
    path: "/one-tab.mp4",
    format: "video/mp4",
    svg: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="size-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
        />
      </svg>
    ),
  },
] as Feature[];

// An SEO-friendly accordion component including the title and a description (when clicked.)
const Item = ({
  feature,
  isOpen,
  index,
  setFeatureSelected,
}: {
  index: number;
  feature: Feature;
  isOpen: boolean;
  setFeatureSelected: () => void;
}) => {
  const accordion = useRef(null);
  const { title, description, svg } = feature;

  return (
    <li className="flex flex-col">
      <div className="flex justify-between items-center">
        <button
          className="relative flex gap-2 items-center w-full py-5 text-base font-bold text-left md:text-lg"
          onClick={(e) => {
            e.preventDefault();
            setFeatureSelected();
          }}
          aria-expanded={isOpen}
        >
          <span className={`duration-100 ${isOpen ? "text-primary" : ""}`}>
            {svg}
          </span>
          <span
            className={`flex-1 text-base-content ${
              isOpen ? "text-primary font-semibold" : ""
            }`}
          >
            <h3
              className={`inline ${
                isOpen ? "text-primary" : "text-neutral-200"
              } `}
            >
              {title}
            </h3>
          </span>
        </button>

        {isOpen ? (
          <ChevronDownIcon
            className={"text-white h-6 w-6"}
            onClick={(e) => {
              e.preventDefault();
              setFeatureSelected();
            }}
          />
        ) : (
          <ChevronRightIcon
            className={"text-white h-6 w-6"}
            onClick={(e) => {
              e.preventDefault();
              setFeatureSelected();
            }}
          />
        )}
      </div>

      <div
        ref={accordion}
        className={`transition-all duration-300 ease-in-out text-base-content-secondary overflow-hidden flex flex-col gap-4`}
        style={
          isOpen
            ? { maxHeight: accordion?.current?.scrollHeight, opacity: 1 }
            : { maxHeight: 0, opacity: 0 }
        }
      >
        <div className="">{description}</div>
        <div className="w-full h-full flex justify-center self-center xl:hidden">
          <Media feature={features[index]} key={index} />
        </div>
      </div>
    </li>
  );
};

// A component to display the media (video or image) of the feature. If the type is not specified, it will display an empty div.
// Video are set to autoplay for best UX.
const Media = ({ feature }: { feature: Feature }) => {
  const { type, path, format, alt } = feature;
  const style = "w-full rounded-2xl sm:max-w-2xl sm:rounded-3xl";
  const size = {
    width: 500,
    height: 500,
  };

  if (type === "video") {
    return (
      <video
        className={style}
        autoPlay
        muted
        loop
        playsInline
        width={size.width}
        height={size.height}
      >
        <source src={path} type={format} />
      </video>
    );
  } else if (type === "image") {
    return (
      <Image
        src={path}
        alt={alt}
        className={`${style} object-cover object-center`}
        width={size.width}
        height={size.height}
      />
    );
  } else {
    return <div className={`${style} !border-none`}></div>;
  }
};

// A component to display 2 to 5 features in an accordion.
// By default, the first feature is selected. When a feature is clicked, the others are closed.
const ExploreFeaturesAccordion = () => {
  const [featureSelected, setFeatureSelected] = useState<number>(0);

  return (
    <section
      className="py-24 md:py-32 space-y-24 md:space-y-32 max-w-7xl mx-auto bg-base-100 "
      id="features"
    >
      <div className="px-3">
        <h2 className="text-white font-extrabold text-4xl lg:text-5xl tracking-tight mb-5">
          Supercharge your Search
        </h2>
        <div className=" flex flex-col md:flex-row gap-12 md:gap-24">
          <div className="grid grid-cols-1 items-stretch gap-8 sm:gap-12 xl:grid-cols-2 lg:gap-20">
            <ul className="w-full xl:flex xl:flex-col xl:gap-5">
              {features.map((feature, i) => (
                <Item
                  key={feature.title}
                  index={i}
                  feature={feature}
                  isOpen={featureSelected === i}
                  setFeatureSelected={() => setFeatureSelected(i)}
                />
              ))}
            </ul>

            <div className="w-full h-fit justify-center self-center hidden xl:flex">
              <Media
                feature={features[featureSelected]}
                key={featureSelected}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExploreFeaturesAccordion;
