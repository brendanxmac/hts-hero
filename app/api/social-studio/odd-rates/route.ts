import { NextResponse } from "next/server"
import { errorResponse } from "@/libs/hts-revision-diff/route-helpers"
import { requireSocialStudio } from "@/libs/social-studio/access"
import { listOddRates } from "@/libs/social-studio/build"

export const dynamic = "force-dynamic"

// Every odd duty rate in the HTS, for the studio's Odd rates tab: most post-worthy first, each
// saying whether HTS Hero calculates it (only those get posts)
export async function GET() {
  const { denied } = await requireSocialStudio()
  if (denied) return denied
  try {
    return NextResponse.json({ rates: await listOddRates() })
  } catch (e) {
    return errorResponse(e)
  }
}
