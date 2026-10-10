import { SOCIAL_IMAGE_SIZE, socialImage } from "@/libs/blog/socialImage";

// The share card for the tariffs-by-country hub
export const size = SOCIAL_IMAGE_SIZE;
export const contentType = "image/png";
export const alt = "US tariffs by country, HTS Hero";

export default function Image() {
  return socialImage({
    kicker: "Every country of origin · 2026",
    title: "US tariffs by country",
    footer: "htshero.com/duty-calculator/countries",
  });
}
