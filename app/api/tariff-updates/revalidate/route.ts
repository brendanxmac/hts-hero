import { NextRequest, NextResponse } from "next/server"
import { revalidateTariffUpdates } from "@/libs/tariff-updates/revalidate"

export const dynamic = "force-dynamic"

// Rebuilds the public /tariff-updates pages; called by `npm run tariff-updates:process`, which
// runs outside Next and can't clear its cache itself
export async function POST(req: NextRequest) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 })
  }
  revalidateTariffUpdates()
  return NextResponse.json({ ok: true })
}
