import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/16/solid";
import { useRef } from "react";
import { FeatureI } from "./FeaturesAccordion";
import { Media } from "./Media";

interface Props {
  index: number;
  feature: FeatureI;
  features: FeatureI[];
  isOpen: boolean;
  setFeatureSelected: () => void;
}

// An SEO-friendly accordion component including the title and a description (when clicked.)
export const AccordionItem = ({
  features,
  feature,
  isOpen,
  index,
  setFeatureSelected,
}: Props) => {
  const accordion = useRef(null);
  const { title, description, titleSvg: svg } = feature;

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
          <span className={`${isOpen ? "text-primary" : ""}`}>{svg}</span>
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
        className={`transition-all duration-100 ease-in-out text-base-content-secondary overflow-hidden flex flex-col gap-4`}
        style={
          isOpen
            ? { maxHeight: accordion?.current?.scrollHeight, opacity: 1 }
            : { maxHeight: 0, opacity: 0 }
        }
      >
        <div className="">{description}</div>
        <div className="w-full h-full flex justify-center self-center lg:hidden">
          <Media feature={features[index]} key={index} />
        </div>
      </div>
    </li>
  );
};
