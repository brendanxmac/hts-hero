import Link from "next/link";
import { ArrowRightIcon, CloudArrowUpIcon, UserCircleIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import { TRIAL_ALLOWANCE } from "@/components/pricing-calculator/lib/pricing";
import { SectionIntro } from "@/components/ui/marketing";
import * as mk from "@/components/ui/marketing/styles";
import { COMING_LOWER, SAVINGS_AUDITS_LABEL } from "@/components/ui/marketing/comingSoon";
import { REQUEST_ANCHOR, SELF_AUDIT_LIVE, SELF_AUDIT_URL, SIGN_UP_TO_AUDIT } from "../lib/links";

// While self-serve audits are off (SELF_AUDIT_LIVE, features.ts), the two self-serve paths show
// "Coming soon" with no link, and the request (done by hand) is the featured way to start
const PATHS: {
  title: string;
  text: string;
  cta: string;
  href: string;
  Icon: typeof UserCircleIcon;
  featured: boolean;
  soon: boolean;
  soonLabel?: string;
}[] = [
    {
      title: "Audit it yourself",
      text: SELF_AUDIT_LIVE
        ? `Run the audit in the Tariff Tracker: ${TRIAL_ALLOWANCE.auditChecks} free audit checks with any account, no credit card. Results appear as soon as your entries are checked, and stay in your account.`
        : `Automatic auditing in the Tariff Tracker is ${COMING_LOWER}: every entry checked against the duty in force on its date, flagging possible over and underpayments, included in the trial and every plan. Until then, request an audit and we'll review your entries for you.`,
      cta: "Start free",
      href: SIGN_UP_TO_AUDIT,
      Icon: UserCircleIcon,
      featured: SELF_AUDIT_LIVE,
      soon: !SELF_AUDIT_LIVE,
      soonLabel: SAVINGS_AUDITS_LABEL,
    },
    {
      title: "Try it without an account",
      text: SELF_AUDIT_LIVE
        ? "Upload your entries now and we'll email you a free one-time check of the results. No account needed."
        : "Uploading your entries for a one-time check, with no account, is coming soon too.",
      cta: "Upload your entries",
      href: SELF_AUDIT_URL,
      Icon: CloudArrowUpIcon,
      featured: false,
      soon: !SELF_AUDIT_LIVE,
    },
    {
      title: "Have us do it",
      text: "Tell us about your company and we'll review your entries and send you a report of potential overpaid and underpaid duty, for your customs broker to act on.",
      cta: "Request an audit",
      href: REQUEST_ANCHOR,
      Icon: UserGroupIcon,
      featured: !SELF_AUDIT_LIVE,
      soon: false,
    },
  ];

// The three ways to start an audit, side by side
export const StartPaths = () => (
  <section className={`${mk.band} ${mk.bandMuted}`} aria-labelledby="start-title">
    <div className={mk.container}>
      <SectionIntro eyebrow="Get started" title="Three ways to start" id="start-title" center />
      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {PATHS.map(({ title, text, cta, href, Icon, featured, soon, soonLabel }) =>
          soon ? (
            <article key={title} className={`${mk.card} flex flex-col p-8`}>
              <Icon className="h-8 w-8 text-base-content/50" aria-hidden />
              <h3 className={`${mk.h3} mt-5`}>{title}</h3>
              <p className={`${mk.body} mt-2 flex-1`}>{text}</p>
              <span className={`${mk.buttonSecondary} mt-8 w-full cursor-default opacity-60`} aria-disabled="true">
                {soonLabel ?? "Coming soon"}
              </span>
            </article>
          ) : featured ? (
            <article key={title} className="relative flex flex-col overflow-hidden hts-tracker-on-dark rounded-3xl bg-base-200 p-8 text-base-content">
              <Icon className="relative h-8 w-8 text-primary" aria-hidden />
              <h3 className="relative mt-5 text-xl font-semibold">{title}</h3>
              <p className="relative mt-2 flex-1 leading-relaxed text-base-content/70">{text}</p>
              <Link href={href} className={`${mk.buttonOnDark} relative mt-8 w-full`}>
                {cta} <ArrowRightIcon className="h-4 w-4" aria-hidden />
              </Link>
            </article>
          ) : (
            <article key={title} className={`${mk.card} flex flex-col p-8`}>
              <Icon className="h-8 w-8 text-primary" aria-hidden />
              <h3 className={`${mk.h3} mt-5`}>{title}</h3>
              <p className={`${mk.body} mt-2 flex-1`}>{text}</p>
              <Link href={href} className={`${mk.buttonSecondary} mt-8 w-full`}>
                {cta}
              </Link>
            </article>
          )
        )}
      </div>
    </div>
  </section>
);
