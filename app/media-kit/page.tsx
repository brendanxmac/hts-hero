import { Metadata } from "next";
import { MediaKit } from "@/components/media-kit/MediaKit";
import { DataStatus } from "@/components/media-kit/DataStatus";
import { guardAdmin } from "@/libs/admin/access";
import { loadMediaKit } from "@/libs/media-kit/load";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Partner With HTS Hero | Media Kit",
  description: "HTS Hero's audience of US importers, ecommerce sellers and sourcing teams, and the placements available to partners.",
  robots: { index: false, follow: false },
};

export default async function MediaKitPage() {
  await guardAdmin();
  const data = await loadMediaKit();
  return (
    <>
      <DataStatus data={data} />
      <MediaKit data={data} />
    </>
  );
}
