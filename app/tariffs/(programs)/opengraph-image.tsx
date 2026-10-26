import { SOCIAL_IMAGE_SIZE, socialImage } from "@/libs/blog/socialImage";

// The share card for /tariffs, every US tariff program
export const size = SOCIAL_IMAGE_SIZE;
export const contentType = "image/png";
export const alt = "US tariff programs from HTS Hero";

export default function Image() {
  return socialImage({
    kicker: "US Tariff Programs · HTS Hero",
    title: "Every Section 232, 301, 338 and IEEPA tariff, with the HTS codes each covers",
    footer: "htshero.com/tariffs",
  });
}
