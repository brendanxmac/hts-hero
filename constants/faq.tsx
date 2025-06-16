import Link from "next/link";
import config from "../config";
import { FAQItem } from "../components/FAQItem";

export const classifierFaqList: FAQItem[] = [
  {
    question: "What do I get exactly?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        Depending on your{" "}
        <Link
          href={"/about/classifier#pricing"}
          className="text-secondary underline"
        >
          plan
        </Link>
        , you&apos;ll immdeiately have access to the HTS classification tool &
        the{" "}
        <Link
          href={"/about/classifier#features"}
          className="text-secondary underline"
        >
          features mentioned above
        </Link>
        . This will allow you to find the HTS code(s) for whatever it is
        you&apos;re importing!
      </div>
    ),
  },
  {
    question: "How can I get access?",
    answer: (
      <div className="flex flex-col gap-4">
        <p>
          All you need is a{" "}
          <Link
            href={"/about/importer#pricing"}
            className="text-secondary underline"
          >
            plan
          </Link>{" "}
          and an account!
        </p>
        <button className="btn btn-wide btn-primary">
          <Link href={config.auth.loginUrl}>Sign Up Now</Link>
        </button>{" "}
      </div>
    ),
  },
  {
    question: "How much does it cost?",
    answer: (
      <div className="flex flex-col gap-2">
        <p className="font-bold">
          We do our best to make gettings HTS codes affordable for everyone!
        </p>

        <p>
          Be sure to checkout our{" "}
          <Link
            href={"/about/classifier#pricing"}
            className="text-secondary underline"
          >
            current offers.
          </Link>{" "}
        </p>
      </div>
    ),
  },
];

export const importerFaqList: FAQItem[] = [
  {
    question: "What do I get exactly?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        Depending on your{" "}
        <Link
          href={"/about/importer#pricing"}
          className="text-secondary underline"
        >
          plan
        </Link>
        , you&apos;ll immdeiately have access to the HTS classification tool &
        the{" "}
        <Link
          href={"/about/importer#features"}
          className="text-secondary underline"
        >
          features mentioned above
        </Link>
        . This will allow you to find the HTS code(s) for whatever it is
        you&apos;re importing!
      </div>
    ),
  },
  {
    question: "How can I get access?",
    answer: (
      <div className="flex flex-col gap-4">
        <p>
          All you need is a{" "}
          <Link
            href={"/about/importer#pricing"}
            className="text-secondary underline"
          >
            plan
          </Link>{" "}
          and an account!
        </p>
        <button className="btn btn-wide btn-primary">
          <Link href={config.auth.loginUrl}>Sign Up Now</Link>
        </button>{" "}
      </div>
    ),
  },
  {
    question: "How much does it cost?",
    answer: (
      <div className="flex flex-col gap-2">
        <p className="font-bold">
          We do our best to make gettings HTS codes affordable for everyone!
        </p>

        <p>
          Be sure to checkout our{" "}
          <Link
            href={"/about/importer#pricing"}
            className="text-secondary underline"
          >
            current offers.
          </Link>{" "}
        </p>
      </div>
    ),
  },
  {
    question: "Does this work for all countries?",
    answer: (
      <div className="flex flex-col gap-4">
        <p>
          HTS Hero only provides classifications codes for{" "}
          <span className="font-bold italic">imports to the United States</span>
          . However, we&apos;re considering expanding to other countries soon!
        </p>
      </div>
    ),
  },
  {
    question: "Does this work for exports from the United States?",
    answer: (
      <div className="flex flex-col gap-4">
        <p>
          HTS codes are used for classifying{" "}
          <span className="font-bold italic">imports</span> to the United
          States, whereas "Schedule B" codes are used for classifying{" "}
          <span className="font-bold italic">exports</span> from the United
          States.
          <br /> <br /> Currently HTS Hero only provides HTS Codes and not
          Schedule B.
          <br /> However, support for Schedule B is on our roadmap!
          <br />
          <br />
          Note: The first six digits of both HTS and Schedule B codes are
          identical & reflect the international accepted Harmonized System (HS)
          code.
          <br />
        </p>
      </div>
    ),
  },
];
