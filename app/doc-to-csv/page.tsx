import { DocToCsvTool } from "../../components/DocToCsvTool";
import { getSEOTags } from "@/libs/seo";

export const dynamic = "force-dynamic";

export const metadata = getSEOTags({
  title: "Trade Documents to CSV | HTS Hero",
  description:
    "Convert commercial invoices, packing lists, and bills of lading into spreadsheets for record keeping and import into other systems",
  canonicalUrlRelative: "/doc-to-csv",
});

export default function DocToCsvPage() {
  return (
    <main className="w-full min-h-0 flex-1 flex flex-col bg-base-100">
      <DocToCsvTool />
    </main>
  );
}
