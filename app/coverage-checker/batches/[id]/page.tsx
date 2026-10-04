import BatchReview from "@/components/hts-coverage/BatchReview"
import { guardRevisionTool } from "../../../revision-checker/guard"

export const dynamic = "force-dynamic"
export const metadata = {
  title: "Batch | Coverage checker | HTS Hero",
  robots: { index: false, follow: false },
}

export default async function CoverageBatchPage({ params }: { params: { id: string } }) {
  await guardRevisionTool()
  return <BatchReview batchId={params.id} />
}
