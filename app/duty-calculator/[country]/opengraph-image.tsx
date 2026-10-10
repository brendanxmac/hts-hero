import { COUNTRY_PAGES, countryPageBySlug } from "@/libs/country-pages/countries";
import { titleName } from "@/components/duty-calculator/country";
import { SOCIAL_IMAGE_SIZE, socialImage } from "@/libs/blog/socialImage";

// The share card for a country calculator page
export const size = SOCIAL_IMAGE_SIZE;
export const contentType = "image/png";
export const alt = "HTS Hero tariff calculator";
export const dynamicParams = false;

export function generateStaticParams() {
  return COUNTRY_PAGES.map((c) => ({ country: c.slug }));
}

export default function Image({ params }: { params: { country: string } }) {
  const country = countryPageBySlug(params.country);
  const name = country ? titleName(country) : "Country";
  return socialImage({
    kicker: "Tariff calculator · 2026",
    title: `${name} to US tariff calculator`,
    footer: `htshero.com/duty-calculator/${params.country}`,
  });
}
