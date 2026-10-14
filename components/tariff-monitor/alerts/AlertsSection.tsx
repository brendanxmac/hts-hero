import { BellAlertIcon, ChatBubbleLeftRightIcon, EnvelopeIcon, UsersIcon } from "@heroicons/react/24/solid";
import { Reveal, SectionIntro } from "@/components/ui/marketing";
import * as mk from "@/components/ui/marketing/styles";
import { CHANNELS, SOURCES } from "../lib/copy";
import { CatalogFrame } from "./CatalogFrame";

const CHANNEL_STYLE = [
  { Icon: EnvelopeIcon, color: "bg-warning/10 text-warning ring-warning" },
  { Icon: BellAlertIcon, color: "bg-primary/10 text-primary ring-primary/20" },
  { Icon: ChatBubbleLeftRightIcon, color: "bg-warning/10 text-warning ring-warning" },
  { Icon: UsersIcon, color: "bg-base-100 text-base-content/70 ring-base-300" },
];

// Alerts: where they come from, where they go, and what one looks like on your catalog
export const AlertsSection = () => (
  <section className={`${mk.band} ${mk.bandMuted}`} aria-labelledby="alerts-title">
    <div className={`${mk.container} grid grid-cols-1 gap-16 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center`}>
      <div>
        <SectionIntro eyebrow="Alerts" title="Every change, wherever your team works" id="alerts-title">
          A heads-up when a tariff is announced, and a rate alert when it reaches the HTS, with the products it hits and
          what it costs at your volumes.
        </SectionIntro>
        <div className="mt-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-base-content/60">Sent to</p>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {CHANNELS.map((c, i) => {
              const { Icon, color } = CHANNEL_STYLE[i];
              return (
                <li key={c.name} className={`flex items-start gap-3 rounded-xl p-4 ring-1 ${color}`}>
                  <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
                  <span>
                    <span className="block font-semibold">{c.name}</span>
                    <span className="text-sm opacity-80">{c.detail}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="mt-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-base-content/60">Watching</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {SOURCES.map((s) => (
              <li key={s.name} className="rounded-full bg-base-100 px-3 py-1.5 text-sm text-base-content/70 ring-1 ring-base-300">
                <span className="font-semibold">{s.name}</span> <span className="text-base-content/60">· {s.detail}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <Reveal className="pb-10">
        <CatalogFrame />
      </Reveal>
    </div>
  </section>
);
