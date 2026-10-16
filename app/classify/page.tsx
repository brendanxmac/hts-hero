import config from "@/config";
import { renderSchemaJsonLd } from "@/libs/seo";
import { PricingPlan } from "@/types";
import { ClassifyFaq, ClassifyHero, ClassifyPlans, ClosingCta, Examples, HowItWorks, Testimonials, VideoBand } from "@/components/classify-landing";
import * as mk from "@/components/ui/marketing/styles";

// The classification assistant's landing page, in the Tariff Tracker's look (the layout's
// FollowTheme): light and muted bands alternate, with the video on a dark one.
export default function ClassifyPage() {
  return (
    <main className={`${mk.page} w-full flex-1 shrink-0`}>
      {renderSchemaJsonLd({
        "@type": "SoftwareApplication",
        name: "HTS Hero Classification Assistant",
        url: `https://${config.domainName}/classify`,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        description:
          "Produce audit-ready HTS classifications in minutes: quickly find candidates, eliminate blind spots, and back every code with legal notes and CROSS rulings.",
        // The self-serve plans; Team is priced to scale
        offers: config.stripe.classifierPlans
          .filter((plan) => plan.planIdentifier !== PricingPlan.CLASSIFY_TEAM)
          .map((plan) => ({
            "@type": "Offer",
            name: plan.name,
            price: String(plan.prices[0]),
            priceCurrency: "USD",
            priceSpecification: {
              "@type": "UnitPriceSpecification",
              price: String(plan.prices[0]),
              priceCurrency: "USD",
              unitText: "MONTH",
            },
          })),
        provider: { "@type": "Organization", name: "HTS Hero", url: `https://${config.domainName}` },
      })}
      {renderSchemaJsonLd({
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "HTS Hero", item: `https://${config.domainName}` },
          { "@type": "ListItem", position: 2, name: "Classification assistant", item: `https://${config.domainName}/classify` },
        ],
      })}
      <ClassifyHero />
      <Testimonials />
      <HowItWorks />
      <Examples />
      <VideoBand />
      <ClassifyPlans />
      <ClassifyFaq />
      <ClosingCta />
    </main>
  );
}
