import { SOCIAL_IMAGE_SIZE, socialImage } from "@/libs/blog/socialImage";

// The share card for the Tariff Tracker's page
export const size = SOCIAL_IMAGE_SIZE;
export const contentType = "image/png";
export const alt = "Tariff Tracker by HTS Hero: alerts when a tariff change hits your products";

export default function Image() {
  return socialImage({
    kicker: "Tariff Tracker · HTS Hero",
    title: "Know the moment a tariff change hits your products",
    footer: "htshero.com/tariff-monitor",
  });
}
