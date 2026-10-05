import AttemptInspector from "@/components/hts-revision-diff/AttemptInspector"
import { guardRevisionTool, revisionToolMetadata } from "../../guard"

export const dynamic = "force-dynamic"
export const metadata = revisionToolMetadata

export default async function AttemptPage({ params }: { params: { id: string } }) {
  await guardRevisionTool()
  return <AttemptInspector attemptId={params.id} />
}
