import AttemptInspector from "@/components/hts-revision-diff/AttemptInspector"
import { guardRevisionTool, revisionToolMetadata } from "../../guard"

export const dynamic = "force-dynamic"
export const metadata = revisionToolMetadata

export default async function AttemptPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  await guardRevisionTool()
  return <AttemptInspector attemptId={params.id} />
}
