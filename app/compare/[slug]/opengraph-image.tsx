import { COMPARE_PAGES, comparePage, comparePageTitle } from "@/libs/compare/pages";
import { SOCIAL_IMAGE_SIZE, socialImage } from "@/libs/blog/socialImage";

export const size = SOCIAL_IMAGE_SIZE;
export const contentType = "image/png";
export const alt = "HTS Hero comparison";
export const dynamicParams = false;

export function generateStaticParams() {
  return COMPARE_PAGES.map((p) => ({ slug: p.slug }));
}

const KICKERS = { roundup: "Tariff calculators compared", vs: "Comparison", alternatives: "Alternatives" } as const;

export default function Image({ params }: { params: { slug: string } }) {
  const page = comparePage(params.slug);
  return socialImage({
    kicker: page ? KICKERS[page.kind] : "Compare",
    title: page ? comparePageTitle(page) : "How HTS Hero compares",
    footer: "htshero.com/compare",
  });
}
