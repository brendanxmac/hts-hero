import Link from "next/link";
import config from "../config";
import { FAQItem } from "../components/FAQItem";

export const tariffImpactFaqList: FAQItem[] = [
  {
    question: "Which announcements or updates do you support?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        You can see the full list of announcements and tariff updates we support
        by checking the dropdown on the{" "}
        <a href="/tariffs/impact-checker" className="text-secondary underline">
          Impact Checker
        </a>
        .
      </div>
    ),
  },
  {
    question:
      "How long does it take you to update the system when new announcements are made?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        In most cases, when official announcements and updates are made, we can
        add them within a few hours.
        <br />
        Depending on the announcement or update, sometimes we can add the new
        list prior to it&apos;s official go-live date to give you even earlier
        heads up.
      </div>
    ),
  },
  {
    question: "Where do you get the lists outline what HTS Codes are impacted?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        We always include the source(s) we used to compile the list of impacted
        codes right in the dropdown menu on the{" "}
        <a href="/tariffs/impact-checker" className="text-secondary underline">
          Impact Checker
        </a>
        .
        <br />
        <br />
        If you notice missing or incorrect sources or codes, please{" "}
        <a href="mailto:support@htshero.com" className="link text-secondary">
          let us know!
        </a>
      </div>
    ),
  },
  {
    question: "Can you notify me when new updates are added?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        We&apos;re currently working on supporting this!
        <br />
        <br />
        If notifications are something you&apos;d like to see, send us a quick{" "}
        <a href="mailto:support@htshero.com" className="link text-secondary">
          message
        </a>{" "}
        and we will bump it up the priority list!
      </div>
    ),
  },
  {
    question: "Can I save lists of codes to check against later on?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        We&apos;re adding this feature soon!
        <br />
        <br />
        If this is something you&apos;d like to be able to do, send us a quick{" "}
        <a href="mailto:support@htshero.com" className="link text-secondary">
          message
        </a>{" "}
        and we will bump it up the priority list!
      </div>
    ),
  },
];

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
