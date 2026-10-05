import { notFound } from "next/navigation"
import { canUseRevisionTool } from "@/libs/hts-revision-diff/access"

// The revision checker only exists for the admin, and only where
// HTS_REVISION_TOOL_ENABLED=true. Everyone else gets a 404.
export const guardRevisionTool = async () => {
  if (!(await canUseRevisionTool())) notFound()
}

export const revisionToolMetadata = {
  title: "Revision checker | HTS Hero",
  robots: { index: false, follow: false },
}
