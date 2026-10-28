import { SOCIAL_IMAGE_SIZE } from "@/libs/blog/socialImage";
import { homeHeadlineImage } from "@/libs/headlineImage";

// The share card for the Tariff Alerts page: the homepage's headline (libs/headlineImage.tsx)
export const size = SOCIAL_IMAGE_SIZE;
export const contentType = "image/png";
export const alt = "HTS Hero: get alerts when new tariffs affect your imports";

export default function Image() {
  return homeHeadlineImage();
}
