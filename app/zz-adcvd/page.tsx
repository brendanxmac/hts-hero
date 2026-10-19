import { headers } from "next/headers"
import { FollowTheme } from "@/components/ui/marketing/FollowTheme"
import type { AdcvdLookup } from "@/libs/adcvd/match"
import Preview from "./Preview"

// Temporary, local only: the AD/CVD tab's case view with real data, for checking the layout without
// signing in. Never commit; delete after.
export const dynamic = "force-dynamic"

export default async function Page(props: { searchParams: Promise<{ code?: string; country?: string }> }) {
  const searchParams = await props.searchParams;
  const code = searchParams.code ?? "7317005502"
  const country = searchParams.country ?? "VN"
  const host = (await headers()).get("host")
  const res = await fetch(`http://${host}/api/adcvd/match?code=${code}&country=${country}`, {
    headers: { authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}` },
    cache: "no-store",
  })
  const data = (await res.json()) as AdcvdLookup
  return (
    <FollowTheme>
      <main className="mx-auto max-w-(--breakpoint-xl) px-6 py-10">
        <Preview data={data} code={code} country={country} />
      </main>
    </FollowTheme>
  )
}
