import Link from "next/link";
import {
  ArrowRightIcon,
  BellAlertIcon,
  ChartBarIcon,
  ClipboardDocumentCheckIcon,
  GlobeAmericasIcon,
  MegaphoneIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { SectionIntro } from "@/components/ui/marketing";
import * as mk from "@/components/ui/marketing/styles";
import { FEATURES } from "../lib/copy";

// One icon and tint per feature, in FEATURES order
const LOOK = [
  { Icon: BellAlertIcon, tint: "bg-teal-50 text-teal-700" },
  { Icon: MegaphoneIcon, tint: "bg-amber-50 text-amber-700" },
  { Icon: ChartBarIcon, tint: "bg-sky-50 text-sky-700" },
  { Icon: ClipboardDocumentCheckIcon, tint: "bg-rose-50 text-rose-700" },
  { Icon: GlobeAmericasIcon, tint: "bg-emerald-50 text-emerald-700" },
  { Icon: UserGroupIcon, tint: "bg-slate-100 text-slate-700" },
];

export const FeatureGrid = () => (
  <section className={mk.band} aria-labelledby="features-title">
    <div className={mk.container}>
      <SectionIntro eyebrow="Features" title="More than an alert" id="features-title" center>
        The full picture for every product you import: what you pay today, how it got there, what you may have overpaid,
        and where it could be lower.
      </SectionIntro>
      <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f, i) => {
          const { Icon, tint } = LOOK[i % LOOK.length];
          return (
            <article key={f.title} className={`${mk.card} flex flex-col gap-4 p-7 transition-colors hover:border-teal-300`}>
              <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${tint}`}>
                <Icon className="h-6 w-6" aria-hidden />
              </span>
              <h3 className={mk.h3}>{f.title}</h3>
              <p className={mk.body}>{f.text}</p>
              {f.href && (
                <Link href={f.href} className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-teal-700 hover:text-teal-800">
                  {f.linkText} <ArrowRightIcon className="h-4 w-4" aria-hidden />
                </Link>
              )}
            </article>
          );
        })}
      </div>
    </div>
  </section>
);
