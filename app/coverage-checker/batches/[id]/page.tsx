import BatchReview from "@/components/hts-coverage/BatchReview"
import { guardRevisionTool } from "../../../revision-checker/guard"

export const dynamic = "force-dynamic"
export const metadata = {
  title: "Batch | Coverage checker | HTS Hero",
  robots: { index: false, follow: false },
}

export default async function CoverageBatchPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  await guardRevisionTool()
  return <BatchReview batchId={params.id} />
}
