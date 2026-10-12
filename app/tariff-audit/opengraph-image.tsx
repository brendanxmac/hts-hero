import { SOCIAL_IMAGE_SIZE, socialImage } from "@/libs/blog/socialImage";

// The share card for the tariff audit page
export const size = SOCIAL_IMAGE_SIZE;
export const contentType = "image/png";
export const alt = "Tariff audit by HTS Hero: find the import duty you overpaid";

export default function Image() {
  return socialImage({
    kicker: "Tariff audit · HTS Hero",
    title: "Find the duty you overpaid. Get it back.",
    footer: "htshero.com/tariff-audit",
  });
}
