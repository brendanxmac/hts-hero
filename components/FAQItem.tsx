import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { useRef, useState } from "react";

export interface FAQItem {
  question: string;
  answer: JSX.Element;
}

export interface Props {
  item: FAQItem;
}

export const FaqItem = ({ item }: Props) => {
  const { question, answer } = item;
  const accordion = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <li>
      <button
        className="relative flex gap-2 items-center w-full py-5 text-base font-semibold text-left border-t md:text-lg border-base-content/10"
        onClick={(e) => {
          e.preventDefault();
          setIsOpen(!isOpen);
        }}
        aria-expanded={isOpen}
      >
        <span className={`flex-1 ${isOpen && "text-primary"}`}>{question}</span>
        {isOpen ? (
          <ChevronDownIcon
            className={"text-white h-6 w-6"}
            onClick={(e) => {
              e.preventDefault();
              setIsOpen(false);
            }}
          />
        ) : (
          <ChevronRightIcon
            className={"text-white h-6 w-6"}
            onClick={(e) => {
              e.preventDefault();
              setIsOpen(true);
            }}
          />
        )}
      </button>

      <div
        ref={accordion}
        className={`transition-all duration-300 ease-in-out opacity-80 overflow-hidden`}
        style={
          isOpen
            ? { maxHeight: accordion?.current?.scrollHeight, opacity: 1 }
            : { maxHeight: 0, opacity: 0 }
        }
      >
        <div className="pb-5 leading-relaxed">{answer}</div>
      </div>
    </li>
  );
};
