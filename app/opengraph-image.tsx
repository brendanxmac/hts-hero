import { SOCIAL_IMAGE_SIZE } from "@/libs/blog/socialImage";
import { homeHeadlineImage } from "@/libs/headlineImage";

// The share card for the homepage: its headline (libs/headlineImage.tsx)
export const size = SOCIAL_IMAGE_SIZE;
export const contentType = "image/png";
export const alt = "HTS Hero: eliminate tariff overpayments and surprises";

export default function Image() {
  return homeHeadlineImage();
}
