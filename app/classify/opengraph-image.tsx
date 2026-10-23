import { SOCIAL_IMAGE_SIZE } from "@/libs/blog/socialImage";
import { headlineImage } from "@/libs/headlineImage";

// The share card for the classification assistant's page
export const size = SOCIAL_IMAGE_SIZE;
export const contentType = "image/png";
export const alt = "HTS Hero classification assistant: audit-ready classifications in minutes";

export default function Image() {
  return headlineImage({
    kicker: "Classification Assistant",
    lines: ["Produce Audit-Ready", "Classifications", "in Minutes"],
    fontSize: 100,
  });
}
