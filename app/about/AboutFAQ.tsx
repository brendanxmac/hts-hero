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
  // {
  //   question: "What's the price?",
  //   answer: (
  //     <div className="flex flex-col gap-2">
  //       <p className="text-2xl font-bold">Free!</p>
  //       <p>
  //         While we&apos;re in Beta all usage of HTS Hero is free, but if you
  //         feel like helping us out you can share it with anyone who might get
  //         some value from it.
  //       </p>
  //     </div>
  //   ),
  // },
  {
    question: "What do I get exactly?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        Depending on the plan you choose you&apos;ll immdeiately get access to
        the all the features & benefits mentioned above in the pricing section.
      </div>
    ),
  },
  {
    question: "How can I get access?",
    answer: (
      <div className="leading-relaxed flex flex-col gap-2">
        <p>
          Register with Google in a few clicks, or recieve a link to your email
          that will give you instant access.
        </p>
        {/* <button className="mt-3 btn btn-wide bg-white rounded-md text-black hover:bg-neutral-800 hover:text-white">
          <Link href={config.auth.loginUrl}>Sign Up Now</Link>
        </button> */}
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

const AboutFAQ = () => {
  return (
    <section className="bg-black" id="faq">
      <div className="py-24 px-8 max-w-7xl mx-auto flex flex-col md:flex-row gap-12">
        <div className="flex flex-col text-left basis-1/2">
          <p className="inline-block font-semibold text-primary mb-4">FAQ</p>
          <p className="sm:text-4xl text-3xl font-extrabold text-base-content">
            Frequently Asked Questions
          </p>
          <div className="pt-3 text-neutral-400">
            Have another question? Feel free to drop us an{" "}
            <a
              href="mailto:support@htshero.com"
              target="_blank"
              className="link text-base-content"
            >
              email
            </a>
            .
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

export default AboutFAQ;
