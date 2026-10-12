import ClassificationExamplesSection from "@/components/ClassificationExamplesSection";
import config from "@/config";
import { renderSchemaJsonLd } from "@/libs/seo";
import { PricingPlan } from "@/types";
import { FAQ } from "@/components/FAQ";
import { bundleFaqList } from "@/constants/faq";
import { ClassifyHero, ClassifyPlans, HowItWorks, Testimonials, VideoBand } from "@/components/classify-landing";
import * as mk from "@/components/ui/marketing/styles";
import { THEME_LIGHT } from "@/components/ui/theme";

// The classification assistant's landing page: the original homepage's content and copy, in the
// marketing theme. The examples and the FAQ are the existing components, kept light.
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
      <div className={`${THEME_LIGHT} bg-white pt-20`}>
        <ClassificationExamplesSection />
      </div>
      <VideoBand />
      <ClassifyPlans />
      <div className={THEME_LIGHT}>
        <FAQ faqItems={bundleFaqList} />
      </div>
    </main>
  );
}
