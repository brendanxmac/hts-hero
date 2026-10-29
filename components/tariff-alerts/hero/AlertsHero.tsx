import Link from "next/link";
import { ArrowRightIcon, CheckIcon } from "@heroicons/react/20/solid";
import { PRICING_HREF } from "../lib/nav";
import * as cta from "@/components/ui/marketing/cta";
import * as mk from "@/components/ui/marketing/styles";
import type { AlertExample } from "@/libs/tariff-alerts-example";
import { DEFINITION, PROMISES } from "../lib/copy";
import { AlertCard } from "./AlertCard";

// The page's main button label: every button goes to the plans (lib/nav PRICING_HREF)
export const MAIN_CTA = "Get Tariff Alerts";


// The top of /tariff-alerts: the promise, the answer-first definition and one button, beside the
// alert-then-impact story. The copy is server-rendered, so crawlers and AI assistants read it as is.
export const AlertsHero = ({ example }: { example: AlertExample | null }) => (
  // On desktop it fills the screen under the site header, content centered, so it's all the visitor sees
  <header className={`relative overflow-hidden ${mk.bandTint} lg:flex lg:min-h-[calc(100svh-65px)] lg:items-center`}>
    <div className={`${mk.container} grid grid-cols-1 gap-14 pb-20 pt-16 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:items-center lg:py-20`}>
      <div className="min-w-0">
        <h1>
          <span className={`${mk.display} mt-4 block`}>
            Get Early Alerts When New Tariffs Hit Your Products
          </span>
        </h1>
        <p className={`${mk.lead} mt-6`}>{DEFINITION}</p>
        <div className="mt-10">
          <Link href={PRICING_HREF} className={`${cta.buttonPrimary} w-full`}>
            {MAIN_CTA} <ArrowRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </Link>
        </div>
        <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
          {PROMISES.map((p) => (
            <li key={p} className={`${mk.small} flex items-center gap-1.5`}>
              <CheckIcon className="h-4 w-4 text-success" aria-hidden /> {p}
            </li>
          ))}
        </ul>
      </div>
      {example && <AlertCard example={example} />}
    </div>
  </header>
);
