import Link from "next/link";
import config from "../config";
import { FAQItem } from "../components/FAQItem";

export const classifierFaqList: FAQItem[] = [
  {
    question: "What do I get exactly?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        After starting your trial or purchasing the{" "}
        <Link href={"/about#pricing"} className="text-secondary underline">
          Pro plan
        </Link>
        , you&apos;ll immdeiately have access to HTS Hero & the{" "}
        <Link href={"/about#features"} className="text-secondary underline">
          features mentioned above
        </Link>
        . You will keep access to HTS Hero for as long as you have an active
        subscription or trial.
      </div>
    ),
  },
  {
    question: "How can I get access?",
    answer: (
      <div className="flex flex-col gap-4">
        <p>
          All you need is an account and a valid trial or{" "}
          <Link href={"/about#pricing"} className="text-secondary underline">
            subscription
          </Link>
          . <br />
        </p>
        <button className="btn btn-wide btn-primary">
          <Link href={config.auth.loginUrl}>Sign Up Now</Link>
        </button>{" "}
        <p>
          If you just want to use the{" "}
          <Link href={"/about/explore"} className="text-secondary underline">
            explorer
          </Link>{" "}
          tool, you can access it for free without an account.
        </p>
      </div>
    ),
  },
  {
    question: "How much does it cost?",
    answer: (
      <div className="flex flex-col gap-2">
        <p className="font-bold">
          We do our best to make having a classification assistant affordable
          for everyone!
        </p>

        <p>
          Checkout our{" "}
          <Link href={"/about#pricing"} className="text-secondary underline">
            current offers
          </Link>{" "}
          and if you have and questions don&apos;t hesitate to contact us at{" "}
          <Link
            href={`mailto:${config.resend.supportEmail}`}
            className="text-secondary underline"
          >
            {config.resend.supportEmail}
          </Link>
          .
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
