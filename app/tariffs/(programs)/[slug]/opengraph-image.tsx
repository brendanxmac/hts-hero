import { SOCIAL_IMAGE_SIZE, socialImage } from "@/libs/blog/socialImage";
import { hubBySlug, hubPath } from "@/libs/tariff-programs/hubs";

// The share card for one tariff program page: its name
export const size = SOCIAL_IMAGE_SIZE;
export const contentType = "image/png";
export const alt = "US tariff program from HTS Hero";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const hub = hubBySlug(slug);
  return socialImage({
    kicker: "US Tariff Program · HTS Hero",
    title: hub?.title ?? "US tariff programs",
    footer: `htshero.com${hub ? hubPath(hub) : "/tariffs"}`,
  });
}
