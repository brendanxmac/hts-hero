import { SOCIAL_IMAGE_SIZE, socialImage } from "@/libs/blog/socialImage";

// The share card for the classification assistant's page
export const size = SOCIAL_IMAGE_SIZE;
export const contentType = "image/png";
export const alt = "HTS Hero classification assistant: audit-ready classifications in minutes";

export default function Image() {
  return socialImage({
    kicker: "Classification assistant · HTS Hero",
    title: "Produce Audit-Ready Classifications in Minutes",
    footer: "htshero.com/classify",
  });
}
