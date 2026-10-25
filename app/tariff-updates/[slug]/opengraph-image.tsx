import { SOCIAL_IMAGE_SIZE, socialImage } from "@/libs/blog/socialImage"
import { getPublishedUpdate } from "@/libs/tariff-updates/public"
import { authorityLabel } from "@/components/tariff-updates/labels"

// The share card for one tariff update: its law and headline
export const size = SOCIAL_IMAGE_SIZE
export const contentType = "image/png"
export const alt = "US tariff update from HTS Hero"
export const revalidate = 3600

export default async function Image({ params }: { params: { slug: string } }) {
  const found = await getPublishedUpdate(params.slug)
  return socialImage({
    kicker: found ? `${authorityLabel(found.update.authority)} · US Tariff Update` : "US Tariff Update",
    title: found?.update.title ?? "Latest US tariff updates",
    footer: "htshero.com/tariff-updates",
  })
}
