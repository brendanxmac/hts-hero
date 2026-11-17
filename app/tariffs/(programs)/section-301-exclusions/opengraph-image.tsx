import { SOCIAL_IMAGE_SIZE, socialImage } from "@/libs/blog/socialImage";

// The share card for /tariffs/section-301-exclusions
export const size = SOCIAL_IMAGE_SIZE;
export const contentType = "image/png";
export const alt = "Section 301 China exclusions from HTS Hero";

export default function Image() {
  return socialImage({
    kicker: "Section 301 China · HTS Hero",
    title: "Section 301 exclusions: every HTS code, the deadline and each extension",
    footer: "htshero.com/tariffs/section-301-exclusions",
  });
}
