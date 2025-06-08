"use client";

import { useState, useRef } from "react";
import type { JSX } from "react";
import Image from "next/image";
import { ChevronRightIcon } from "@heroicons/react/20/solid";
import { ChevronDownIcon } from "@heroicons/react/16/solid";
import Link from "next/link";

interface Feature {
  title: string; // The title of the feature
  description: string; // The description of the feature (when clicked)
  type?: "video" | "image"; // The type of media (video or image)
  path?: string; // The path to the media (for better SEO, try to use a local path)
  format?: string; // The format of the media (if type is 'video')
  alt?: string; // The alt text of the image (if type is 'image')
  svg?: JSX.Element;
}

const features = [
  {
    title: "Gets Results in Seconds",
    description:
      "No consultations & no delays. You'll have your code in just moments.",
    type: "video",
    alt: "Results in Seconds Video",
    path: "/finalish.mp4",
    format: "video/mp4",
    svg: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
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
    title: "Finds the Best Candidates",
    description:
      "We find the most likely candidates for your product and move step-by-step to the final code.",
    type: "image",
    alt: "Step by Step Image",
    path: "/step-by-step.png",
    format: "image/png",
    svg: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
        className="size-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8.242 5.992h12m-12 6.003H20.24m-12 5.999h12M4.117 7.495v-3.75H2.99m1.125 3.75H2.99m1.125 0H5.24m-1.92 2.577a1.125 1.125 0 1 1 1.591 1.59l-1.83 1.83h2.16M2.99 15.745h1.125a1.125 1.125 0 0 1 0 2.25H3.74m0-.002h.375a1.125 1.125 0 0 1 0 2.25H2.99"
        />
      </svg>
    ),
  },
  {
    title: "Suggests the Best Option",
    description:
      "At each step we suggest the best option based on your description, and include the rules-based reason why we chose it. This helps you quickly verify the selection and is useful if customs asks how the code was determined.",
    type: "image",
    alt: "Intelligent Suggestions Image",
    path: "/suggested.png",
    svg: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
        className="size-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 0 1-.657.643 48.39 48.39 0 0 1-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 0 1-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 0 0-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 0 1-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 0 0 .657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 0 1-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 0 0 5.427-.63 48.05 48.05 0 0 0 .582-4.717.532.532 0 0 0-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.96.401v0a.656.656 0 0 0 .658-.663 48.422 48.422 0 0 0-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 0 1-.61-.58v0Z"
        />
      </svg>
    ),
  },
  {
    title: "Generates Reports",
    description:
      "Get a detailed report of your entire classification for your own records and to show suppliers or customs. This includes the options, selection, and details at each level, as well as the final HTS Code, description, and tariff rates.",
    type: "image",
    alt: "Classification Report Image",
    path: "/classification-report.png",
    svg: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
        className="size-6"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
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
          <Link
            className="btn btn-primary btn-wide"
            href={"/about/importer#pricing"}
          >
            Try it now!
          </Link>
        </div>
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

export default FeaturesAccordion;
