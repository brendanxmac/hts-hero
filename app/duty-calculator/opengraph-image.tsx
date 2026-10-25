import { SOCIAL_IMAGE_SIZE } from "@/libs/blog/socialImage";
import { homeHeadlineImage } from "@/libs/headlineImage";

// The share card for the duty calculator: the homepage's headline (libs/headlineImage.tsx)
export const size = SOCIAL_IMAGE_SIZE;
export const contentType = "image/png";
export const alt = "HTS Hero: tariff alerts, savings, & audits on autopilot";

export default function Image() {
  return homeHeadlineImage();
}
