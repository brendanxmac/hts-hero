import ComparisonReview from "@/components/hts-revision-diff/ComparisonReview"
import { guardRevisionTool, revisionToolMetadata } from "../../guard"

export const dynamic = "force-dynamic"
export const metadata = revisionToolMetadata

export default async function ComparisonPage({ params }: { params: { id: string } }) {
  await guardRevisionTool()
  return <ComparisonReview comparisonId={params.id} />
}
