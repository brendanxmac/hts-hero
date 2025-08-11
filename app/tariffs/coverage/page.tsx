import config from "@/config";
import { getSEOTags } from "../../../libs/seo";
import {
  TariffCoverageI,
  TariffSection,
} from "../../../components/TariffCoverage";
import { TariffCoverageSection } from "../../../components/TariffCoverageSection";
import Link from "next/link";
import Footer from "../../../components/Footer";

export const metadata = getSEOTags({
  title: `Tariff Coverage | ${config.appName}`,
  canonicalUrlRelative: "/tariffs/coverage",
});

const tariffsCovered: TariffCoverageI[] = [
  {
    name: "Brazil 40% Retaliatory",
  },
  {
    name: "Country Specific Reciprocals",
    details: "Updated as any further adjustments are published",
  },
  {
    name: "European Union Reciprocal (0% or 15%)",
    details: "Uses Ad Valorem Equivalent (AVE) to determine if 0% or 15%",
  },
  {
    name: "Worldwide 10% Reciprocal",
  },
  {
    name: "Copper",
  },
  {
    name: "Copper Derivatives",
  },
  {
    name: "Iron / Steel",
  },
  {
    name: "Iron / Steel Derivatives",
  },
  {
    name: "Aluminum",
  },
  {
    name: "Aluminum Derivatives",
  },
  {
    name: "Automobiles",
  },
  {
    name: "Auto Parts",
  },
  {
    name: "Northern Border Security",
    details: "Canada 35%",
  },
  {
    name: "Southern Border Security",
    details: "Mexico 25%",
  },
  {
    name: "China & Hong Kong 20% IEEPA",
  },
  {
    name: "Articles of China",
    details: "Ch.99, Subsection 3, Notes 20 (a) and (b)",
  },
  {
    name: "Articles of China",
    details: "Ch.99, Subsection 3, Notes 20 (e) and (f)",
  },
  {
    name: "Articles of China",
    details: "Ch.99, Subsection 3, Notes 20 (r) and (s)",
  },
  {
    name: "Articles of China Entered After September 27, 2024",
    details: "Ch.99, Subsection 3, Notes 31 (b)",
  },
  {
    name: "Articles of China Entered Between June 15, 2024 and August 31, 2025",
    details: "Ch.99, Subsection 3, Notes 20 (vvv)",
  },
];

const tariffsComingSoon: TariffCoverageI[] = [
  {
    name: "Specify Country of Smelt / Cast for Section 232 Metals",
  },
  {
    name: "India Retaliatory Based on Russia Oil",
  },
  {
    name: "Japan 15% Reciprocal Cap [If Officially Published]",
    details: "Apply the same deal to Japan that the EU got for reciprocal",
  },
];

const tariffFAQs = [
  {
    topic: "Which tariffs are covered?",
    details:
      "You can see the list above to see which tariffs are currently covered, and which ones are coming soon. We are working towards full comprehensive coverage and are currently prioritizing which to add based on general applicability, complexity, and user demand.",
  },
  {
    topic: "Do you support comparing rates for different countries?",
    details:
      "Yes. You can select any # of countries and see how the rates stack up between them for a given 10-digit HTS code",
  },
  {
    topic: "Do you include tariff stacking?",
    details:
      "Absolutely. We do our best to ensure that the most up to date stacking rules are applied in all cases",
  },
  {
    topic: "Do you include Free Trade Agreements?",
    details:
      "Yes. For any given country you can see if there are FTA's that might be applicable and see how duty is impacted when applied",
  },
  {
    topic: "Do you include exceptions?",
    details:
      "Yes. For any given code & country combination you can see if there are any exceptions that might be applicable and toggle them on if you think they're applicable to see how they impact duty.",
  },
  {
    topic:
      "Do you identify section 232 metals and apply tariffs to the base article and metal content separately?",
    details:
      "Yes. If the HTS code you are looking at falls under the inclusions for a 232 metal, we create a separate tariff line item just for the metal content and update the tariffs that apply for the base article (if applicable). One current limitation we have is not allowing the addition of 232 metal tariffs to an item that has not been directly marked. For example a piece of furniture that has steel, aluminum, and copper but isn't marked as such in the HTS cannot currently be separated out into the different line items based on the different metal contents.",
  },
  {
    topic:
      "Do you support providing a country or smelt or cast for section 232 metals?",
    details:
      "Not currently, however we are working on adding that in right now.",
  },
  {
    topic: "Do you support Anti-Dumping or Countervailing Duties?",
    details:
      "Not currently. We are considering adding support for these in the future. For now you are best of talking to a licensed customs broker to see if these might apply.",
  },
  {
    topic:
      "Do you support providing a customs value to see total landed costs?",
    details:
      "Not currently. We are considering adding support for this in the future.",
  },
];

const TariffFAQ = ({ topic, details }: { topic: string; details: string }) => {
  return (
    <div>
      <h3 className="font-medium text-base-content mb-2">{topic}</h3>
      <p className="text-base-content/70 text-sm">{details}</p>
    </div>
  );
};

export default function Home() {
  return (
    <main className="h-full bg-base-300 overflow-hidden">
      <div className="h-full overflow-y-auto">
        {/* Header Section */}
        <div className="w-full max-w-5xl mx-auto px-6 pt-10">
          <h1 className="text-3xl lg:text-4xl font-bold text-base-content mb-2">
            Our Tariff Coverage
          </h1>
          <p className="text-sm lg:text-lg text-base-content/70 max-w-5xl">
            See which tariffs are currently covered by our system and which ones
            are coming soon.
          </p>
        </div>

        {/* Content Section */}
        <div className="max-w-5xl mx-auto px-6 pt-6 pb-2">
          <div className="grid gap-8">
            {/* Currently Covered Tariffs */}
            <TariffCoverageSection
              name="Currently Covered"
              description="Tariffs that are currently supported by our system."
              type={TariffSection.COVERED}
              tariffs={tariffsCovered}
            />

            {/* Coming Soon Tariffs */}
            <TariffCoverageSection
              name="Coming Soon"
              description="Tariffs in development that will be available soon."
              type={TariffSection.COMING_SOON}
              tariffs={tariffsComingSoon}
            />
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-5xl mx-auto p-6">
          <div className="bg-base-100 rounded-2xl border-2 border-neutral-content/50 p-8">
            <h2 className="text-2xl font-semibold text-base-content mb-4">
              Frequently Asked Questions
            </h2>
            <div className="grid gap-6">
              {tariffFAQs.map((faq) => (
                <TariffFAQ key={faq.topic} {...faq} />
              ))}
              <div>
                <h3 className="font-medium text-base-content mb-2">
                  What if I see something missing?
                </h3>
                <p className="text-base-content/70 text-sm">
                  Need a specific tariff covered or noticed one that missing?{" "}
                  <Link
                    href="mailto:support@htshero.com"
                    className="text-primary"
                  >
                    Contact our team
                  </Link>{" "}
                  to request a quick patch.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-base-content mb-2">
                  What if I see something wrong?
                </h3>
                <p className="text-base-content/70 text-sm">
                  If you have noticed there might be something wrong with the
                  tool, don&apos;t hesitate to{" "}
                  <Link
                    href="mailto:support@htshero.com"
                    className="text-primary"
                  >
                    contact our team
                  </Link>{" "}
                  to request a fix.
                </p>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </main>
  );
}
