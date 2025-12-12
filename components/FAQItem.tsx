"use client";

import { ChevronDownIcon } from "@heroicons/react/24/solid";
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
  const accordion = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <li className="group">
      <button
        className="relative flex items-center gap-4 w-full px-6 py-5 text-left transition-colors duration-200 hover:bg-gradient-to-r hover:from-base-100 hover:to-primary/10"
        onClick={(e) => {
          e.preventDefault();
          setIsOpen(!isOpen);
        }}
        aria-expanded={isOpen}
      >
        {/* Question text */}
        <span
          className={`flex-1 text-base md:text-lg font-semibold transition-colors duration-200 ${
            isOpen ? "text-primary" : "text-base-content"
          }`}
        >
          {question}
        </span>
        {/* Icon container */}
        <div
          className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
            isOpen
              ? "bg-primary text-white rotate-0"
              : "bg-primary/10 text-primary"
          }`}
        >
          <ChevronDownIcon
            className={`w-4 h-4 transition-transform duration-300 ${
              isOpen ? "" : "-rotate-180"
            }`}
          />
        </div>
      </button>

      {/* Answer container */}
      <div
        ref={accordion}
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={
          isOpen
            ? { maxHeight: accordion?.current?.scrollHeight, opacity: 1 }
            : { maxHeight: 0, opacity: 0 }
        }
      >
        <div className="px-6 pb-6 pl-[4.5rem]">
          <div className="text-base-content/70 leading-relaxed prose prose-sm max-w-none">
            {answer}
          </div>
        </div>
      </div>
    </li>
  );
};
