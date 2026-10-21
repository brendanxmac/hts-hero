import { Metadata } from "next"
import Link from "next/link"
import { THEME } from "@/components/ui/theme"
import { trackerDisplay, trackerSans } from "@/components/ui/font"
import * as mk from "@/components/ui/marketing/styles"
import * as tt from "@/components/ui/styles/tracker"
import { ManageSubscription } from "@/components/tariff-updates/ManageSubscription"
import { SubscribeForm } from "@/components/tariff-updates/SubscribeForm"
import { subscriberByToken } from "@/libs/email/subscribers"
import { createAdminClient } from "../../api/supabase/server"

// Where every email's "manage" link lands: change what you get, turn it off, and (once that's done)
// the next step: alerts on your own imports. The token in the link is the key; no sign-in.

export const dynamic = "force-dynamic"
export const metadata: Metadata = {
  title: "Your tariff updates | HTS Hero",
  robots: { index: false, follow: false },
}

export default async function SubscriptionPage(
  props: { searchParams: Promise<{ token?: string; confirmed?: string; unsubscribed?: string }> }
) {
  const searchParams = await props.searchParams;
  const token = searchParams.token ?? ""
  const s = token ? await subscriberByToken(createAdminClient(), token) : null

  return (
    <div className={`${THEME} hts-tracker ${trackerSans.className} ${trackerDisplay.variable} flex w-full flex-1 flex-col bg-base-200`}>
      <div className={`${mk.container} flex max-w-3xl flex-col gap-6 pb-20 pt-10`}>
        <nav aria-label="Breadcrumb" className="text-sm text-base-content/60">
          <Link href="/tariff-updates" className="text-base-content/70 underline-offset-4 hover:text-primary hover:underline">
            Tariff updates
          </Link>
          <span aria-hidden className="mx-1.5">/</span>
          <span>Your subscription</span>
        </nav>
        {s ? (
          <ManageSubscription
            token={token}
            email={s.email}
            hasAccount={!!s.user_id}
            justConfirmed={searchParams.confirmed === "1"}
            initial={{
              frequency: s.unsubscribed_at ? "off" : s.news_frequency,
              scope: s.news_scope,
              authorities: s.news_authorities,
              countries: s.news_countries,
            }}
            unsubscribed={!!s.unsubscribed_at}
            lifecycle={s.lifecycle}
          />
        ) : (
          <section className={`${tt.panel} flex flex-col gap-4 p-7`}>
            <h1 className={`${tt.display} text-2xl font-semibold text-base-content`}>This link isn&apos;t valid any more</h1>
            <p className="text-sm text-base-content/70">Subscribe again below, and we&apos;ll email you a fresh link to confirm.</p>
            <SubscribeForm source="subscription-page" />
          </section>
        )}
      </div>
    </div>
  )
}
