import Link from "next/link";
import config from "../config";
import { FAQItem } from "../components/FAQItem";

export const tariffImpactFaqList: FAQItem[] = [
  {
    question: "Which tariff announcements or updates do you support?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        Any tariff announcement that has a clearly defined list of affected HTS
        codes will be made available for you to check against. <br />
        If an announcement is made that is unclear about exactly what's impacted
        we will still send you a notification and highlight what the
        announcement says it covers.
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
    question: "When do I get notified about my imports being affected?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        Anytime a new tariff announcement affects your imports!
        <br />
        Once we&apos;ve updated the system to include the new tariff
        announcement and made sure everything is working properly, we notify all
        customers on paid plans who have uploaded their lists of HTS codes.
      </div>
    ),
  },
  {
    question: "How do you notify me about my imports being affected?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        We use your lists of HTS Codes to determine if your imports are affected
        by a new tariff announcement. <br />
        You can easily create these lists for your imports and organize them in
        whatever way makes sense to you:
        <br /> <br />
        <ul className="list-disc list-inside">
          <li>One list per customer</li>
          <li>One list per product</li>
          <li>One list per country</li>
          <li>One list with all your codes</li>
          <li>One list with a single code</li>
          <li>etc...</li>
        </ul>
        <br />
        Once your lists are in place, anytime a new tariff announcement impacts
        any of the imports in any of your lists you'll receive an email
        notification (one for each list that is affected).
      </div>
    ),
  },
  {
    question: "Which announcements or updates do you currently support?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        {/* TODO: ADD LIST HERE */}
        You can see the current list of announcements and tariff updates we
        support by checking the announcement dropdown on the{" "}
        <a href="/tariffs/impact-checker" className="text-secondary underline">
          Impact Checker
        </a>
        .
      </div>
    ),
  },
  {
    question: "Where do you get the lists outline what HTS Codes are impacted?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        We use officially published government lists and always cite our
        sources.
        <br />
        <br />
        The source(s) used to create the list of impacted HTS Codes are
        displayed right in the announcement dropdown menu on the{" "}
        <a href="/tariffs/impact-checker" className="text-secondary underline">
          Impact Checker
        </a>
        .
      </div>
    ),
  },
  {
    question: "Can I save lists of my HTS codes to check against later on?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        Of course! This is already supported in the{" "}
        <a href="/tariffs/impact-checker" className="text-secondary underline">
          app
        </a>
        .
      </div>
    ),
  },
  {
    question: "Can you notify me when new updates are added?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        You bet! Upload & save your list of imports and you're all set to
        recieve notifications when your imports are affected as long as you're
        on a{" "}
        <a href="/about/tariffs#pricing" className="text-secondary underline">
          paid plan
        </a>
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
