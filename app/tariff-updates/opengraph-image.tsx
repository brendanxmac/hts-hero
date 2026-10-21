import { SOCIAL_IMAGE_SIZE, socialImage } from "@/libs/blog/socialImage"

// The share card for the tariff updates page
export const size = SOCIAL_IMAGE_SIZE
export const contentType = "image/png"
export const alt = "Latest US tariff updates from HTS Hero"

export default function Image() {
  return socialImage({
    kicker: "US Tariff Updates · HTS Hero",
    title: "Every new US tariff action, from announcement to the HTS",
    footer: "htshero.com/tariff-updates",
  })
}
