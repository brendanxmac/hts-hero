import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/16/solid";
import { useRef } from "react";
import { Media } from "./Media";
import { classNames } from "../utilities/style";
import { FeatureI } from "../interfaces/ui";

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
    <li className="w-full flex flex-col">
      <div className="w-full flex justify-between items-center">
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
        className={`w-full h-full transition-all duration-100 ease-in-out text-base-content-secondary overflow-hidden flex flex-col gap-4`}
      >
        <div className="">{description}</div>
        <div
          className={classNames(
            "w-full h-full flex justify-center self-center object-cover",
            isOpen ? "block" : "hidden"
          )}
        >
          <Media feature={features[index]} key={index} />
        </div>
      </div>
    </li>
  );
};
