"use client";

import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/20/solid";
import { useRef, useState } from "react";
import type { JSX } from "react";

// <FAQ> component is a lsit of <Item> component
// Just import the FAQ & add your FAQ content to the const faqList arrayy below.

interface FAQItemProps {
  question: string;
  answer: JSX.Element;
}

const faqList: FAQItemProps[] = [
  {
    question: "What's the price?",
    answer: (
      <div className="flex flex-col gap-2">
        <p className="text-2xl font-bold">Free!</p>
        <p>
          While we&apos;re in beta all usage of HTS Hero is free, but if you
          feel like helping us out you can share it with anyone who might get
          some value from it.
        </p>
      </div>
    ),
  },
  {
    question: "What do I get exactly?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        After loging in, as long as you have enough credits<sup>*</sup>{" "}
        you&apos;ll immdeiately have access to the HTS lookup tool & the
        features mentioned above.
        <span className="block mt-3 text-xs">
          <sup>*</sup>Everyone has unlimited credits while we&apos;re in beta,
          however there are limits on overall daily usage so I can afford to eat
          tomorrow 😆.
        </span>
      </div>
    ),
  },
];

const FaqItem = ({ item }: { item: FAQItemProps }) => {
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
        <span className={`flex-1 ${isOpen && "text-[#40C969]"}`}>
          {item?.question}
        </span>
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
        <div className="pb-5 leading-relaxed">{item?.answer}</div>
      </div>
    </li>
  );
};

const FAQ = () => {
  return (
    <section className="bg-neutral-900" id="faq">
      <div className="py-24 px-8 max-w-7xl mx-auto flex flex-col md:flex-row gap-12">
        <div className="flex flex-col text-left basis-1/2">
          <p className="inline-block font-semibold text-primary mb-4">FAQ</p>
          <p className="sm:text-4xl text-3xl font-extrabold text-base-content">
            Frequently Asked Questions
          </p>
          <div className="pt-3 text-neutral-400">
            Have another question? Contact me on{" "}
            <a
              className="link text-base-content"
              target="_blank"
              href="https://twitter.com/brendanxmac"
            >
              Twitter
            </a>{" "}
            or by{" "}
            <a
              href="mailto:support@htshero.com"
              target="_blank"
              className="link text-base-content"
            >
              email
            </a>
          </div>
        </div>

        <ul className="basis-1/2 flex flex-col gap-3">
          {faqList.map((item, i) => (
            <FaqItem key={i} item={item} />
          ))}
        </ul>
      </div>
    </section>
  );
};

export default FAQ;
