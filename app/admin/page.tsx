import NeedsYou from "@/components/admin/NeedsYou"
import { guardAdmin } from "@/libs/admin/access"
import { loadAdminQueue } from "@/libs/admin/queue"
import { createAdminClient } from "../api/supabase/server"

export const dynamic = "force-dynamic"
export const metadata = {
  title: "Needs You | HTS Hero Admin",
  robots: { index: false, follow: false },
}

export default async function AdminPage() {
  await guardAdmin()
  return <NeedsYou queue={await loadAdminQueue(createAdminClient())} />
}
