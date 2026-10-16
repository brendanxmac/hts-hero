import { BellAlertIcon } from "@heroicons/react/20/solid"
import * as tt from "@/components/ui/styles/tracker"
import { SubscribeForm } from "./SubscribeForm"

// The tariff news sign-up as a small box of its own, for a page's side rail (the HTS code pages):
// what it is in a line, then the email and a button; or slim, without the box, under a page's
// intro (/explore). Subscribers get the weekly digest of every new US tariff action, and can
// change that from the confirmation email.

export function NewsAlertsBox({ source, slim = false }: { source: string; slim?: boolean }) {
  // Slim: no box, a line and the form, under a page's intro (/explore)
  if (slim)
    return (
      <div className="flex max-w-md flex-col gap-2">
        <p className="m-0 flex items-center gap-2 text-sm font-semibold text-base-content">
          <BellAlertIcon className="h-4 w-4 text-primary" aria-hidden />
          Get Tariff News Alerts
        </p>
        <SubscribeForm source={source} inline />
      </div>
    )
  return (
    <section aria-labelledby="news-alerts" className={`${tt.panel} flex flex-col gap-3 p-6`}>
      <div className="flex flex-col gap-1">
        <h2 id="news-alerts" className={`${tt.title} m-0 flex items-center gap-2 text-base`}>
          <BellAlertIcon className="h-4 w-4 text-primary" aria-hidden />
          Get Tariff News Alerts
        </h2>
        <p className="m-0 text-xs leading-relaxed text-base-content/60">Every new US tariff action in plain English, with the official documents behind it.</p>
      </div>
      <SubscribeForm source={source} inline />
    </section>
  )
}
