import { BellAlertIcon } from "@heroicons/react/20/solid"
import * as tt from "@/components/ui/styles/tracker"
import { SubscribeForm } from "./SubscribeForm"

// The tariff news sign-up as a small box of its own: in a page's side rail (the HTS code pages) or
// beside a page's heading (/explore). What it is in a line, then the email and a button.
// Subscribers get the weekly digest of every new US tariff action, and can change that from the
// confirmation email. `wide` sets the words and the form side by side, for a full-width slot
// (under a Chapter 99 code's hero).

export function NewsAlertsBox({ source, wide = false }: { source: string; wide?: boolean }) {
  return (
    <section
      aria-labelledby="news-alerts"
      className={`${tt.panel} flex flex-col gap-3 p-6 ${wide ? "md:flex-row md:items-center md:justify-between md:gap-8" : ""}`}
    >
      <div className="flex min-w-0 flex-col gap-1">
        <h2 id="news-alerts" className={`${tt.title} m-0 flex items-center gap-2 text-base`}>
          <BellAlertIcon className="h-4 w-4 text-primary" aria-hidden />
          Get Tariff News Alerts
        </h2>
        <p className="m-0 text-xs leading-relaxed text-base-content/60">Every new US tariff action in plain English, with the official documents behind it.</p>
      </div>
      <div className={wide ? "w-full md:w-[22rem] md:shrink-0" : ""}>
        <SubscribeForm source={source} inline />
      </div>
    </section>
  )
}
