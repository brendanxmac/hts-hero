import type { SupabaseClient } from "@supabase/supabase-js"
import { sendTransactional } from "../email/outbox"

// Whether the AD/CVD cron is running. Checked by the tariff sources cron (a different route, so a
// broken AD/CVD route can't hide its own failure): when the AD/CVD cron hasn't run for STALE_HOURS,
// the admin gets one email, then at most one a day until it runs again.

type Db = SupabaseClient

export const STALE_HOURS = 6
const REMIND_HOURS = 24
const NOTIFY = "brendan@htshero.com"

export const checkAdcvdHealth = async (db: Db, now = new Date()) => {
  const { data } = await db.from("adcvd_settings").select("last_cron_at, stale_alerted_at").eq("id", true).maybeSingle()
  // Never run yet (not deployed, or the table is new): nothing to say
  if (!data?.last_cron_at) return { stale: false }
  const hours = (now.getTime() - new Date(data.last_cron_at).getTime()) / 3_600_000
  if (hours < STALE_HOURS) return { stale: false }
  const alertedHoursAgo = data.stale_alerted_at ? (now.getTime() - new Date(data.stale_alerted_at).getTime()) / 3_600_000 : Infinity
  if (alertedHoursAgo < REMIND_HOURS) return { stale: true, emailed: false }
  await sendTransactional(db, {
    recipient: NOTIFY,
    template: "internal_notice",
    props: {
      eyebrow: "AD/CVD cron",
      title: `The AD/CVD cron hasn't run for ${Math.round(hours)} hours`,
      rows: [
        { label: "Last run", value: new Date(data.last_cron_at).toUTCString() },
        { label: "Route", value: "/api/cron/adcvd (vercel.json, every 15 minutes)" },
        { label: "Check", value: "Vercel's cron logs, and /adcvd for the last run's result" },
      ],
    },
  })
  await db.from("adcvd_settings").update({ stale_alerted_at: now.toISOString() }).eq("id", true)
  return { stale: true, emailed: true }
}
