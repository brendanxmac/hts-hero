import ComparisonReview from "@/components/hts-revision-diff/ComparisonReview"
import { guardRevisionTool, revisionToolMetadata } from "../../guard"

export const dynamic = "force-dynamic"
export const metadata = revisionToolMetadata

export default async function ComparisonPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  await guardRevisionTool()
  return <ComparisonReview comparisonId={params.id} />
}
