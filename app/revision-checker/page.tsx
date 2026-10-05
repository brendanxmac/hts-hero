import RevisionCheckerHome from "@/components/hts-revision-diff/RevisionCheckerHome"
import { guardRevisionTool, revisionToolMetadata } from "./guard"

export const dynamic = "force-dynamic"
export const metadata = revisionToolMetadata

export default async function RevisionCheckerPage() {
  await guardRevisionTool()
  return <RevisionCheckerHome />
}
