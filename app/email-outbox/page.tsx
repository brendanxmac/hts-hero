import OutboxDashboard from "@/components/email-outbox/OutboxDashboard"
import { createAdminClient } from "../api/supabase/server"
import { guardAdmin } from "@/libs/admin/access"

export const dynamic = "force-dynamic"
export const metadata = {
  title: "Outbox | HTS Hero",
  robots: { index: false, follow: false },
}

export default async function EmailOutboxPage() {
  await guardAdmin()
  // Recent updates, to draft a test news alert from
  const { data } = await createAdminClient()
    .from("tariff_updates")
    .select("id, title, last_activity_at")
    .eq("status", "published")
    .order("last_activity_at", { ascending: false })
    .limit(30)
  return <OutboxDashboard updates={data ?? []} />
}
