import { DocToCsvTool } from "../../components/DocToCsvTool";
import { getSEOTags } from "@/libs/seo";

export const dynamic = "force-dynamic";

export const metadata = getSEOTags({
  title: "Convert Trade Documents to CSV | HTS Hero",
  description:
    "Turn commercial invoices, packing lists, and bills of lading into a clean spreadsheet you can import or paste into your system. We never store your documents.",
  canonicalUrlRelative: "/doc-to-csv",
});

export default function DocToCsvPage() {
  return (
    <main className="w-full min-h-0 flex-1 flex flex-col bg-base-100">
      <DocToCsvTool />
    </main>
  );
}
