import config from "@/config";
import { getSEOTags } from "../../../libs/seo";
import { BulletPoint, FeatureStatus } from "../../../components/TariffCoverage";
import { TariffCoverageSection } from "../../../components/TariffCoverageSection";
import Link from "next/link";
import Footer from "../../../components/Footer";

export const metadata = getSEOTags({
  title: `Tariff Coverage | ${config.appName}`,
  canonicalUrlRelative: "/tariffs/coverage",
});

const tariffsSupported: BulletPoint[] = [
  {
    title: "Brazil 40% Retaliatory",
  },
  {
    title: "Country Specific Reciprocals",
    description: "Updated as any further adjustments are published",
  },
  {
    title: "European Union Reciprocal (0% or 15%)",
  },
  {
    title: "Worldwide 10% Reciprocal",
  },
  {
    title: "Copper",
  },
  {
    title: "Copper Derivatives",
  },
  {
    title: "Iron / Steel",
  },
  {
    title: "Iron / Steel Derivatives",
  },
  {
    title: "Aluminum",
  },
  {
    title: "Aluminum Derivatives",
  },
  {
    title: "Automobiles",
  },
  {
    title: "Auto Parts",
  },
  {
    title: "Northern Border Security",
    description: "Canada 35%",
  },
  {
    title: "Southern Border Security",
    description: "Mexico 25%",
  },
  {
    title: "China & Hong Kong 20% IEEPA",
  },
  {
    title: "Articles of China",
    description: "Ch.99, Subsection 3, Notes 20 (a) and (b)",
  },
  {
    title: "Articles of China",
    description: "Ch.99, Subsection 3, Notes 20 (e) and (f)",
  },
  {
    title: "Articles of China",
    description: "Ch.99, Subsection 3, Notes 20 (r) and (s)",
  },
  {
    title: "Articles of China Entered After September 27, 2024",
    description: "Ch.99, Subsection 3, Notes 31 (b)",
  },
  {
    title:
      "Articles of China Entered Between June 15, 2024 and August 31, 2025",
    description: "Ch.99, Subsection 3, Notes 20 (vvv)",
  },
];

const capabilitiesSupported: BulletPoint[] = [
  {
    title: "See rates for multiple countries at the same time",
  },
  {
    title: "Automatically applies stacking rules",
  },
  {
    title: "Apply Free Trade Agreements (FTAs)",
  },
  {
    title: "Apply Potential Exclusions",
  },
  {
    title: "Separate lines for Section 232 Metals",
    description: "To properly account for the metal and non-metal contents",
  },
  {
    title: "Shows which tariffs rely on eachother",
    description: "By nesting them within one another",
  },
  {
    title: "Updates live as you make changes",
    description: "Toggles dependent tariffs on and off as you make changes",
  },
  {
    title: "Applies the right EU Reciprocal Tariff",
    description: "Uses Ad Valorem Equivalent to determine if 0% or 15%",
  },
];

const tariffsComingSoon: BulletPoint[] = [
  {
    title: "India Retaliatory Based on Russia Oil",
  },
  {
    title: "Japan 15% Reciprocal Cap [If Officially Published]",
    description: "Apply the same deal to Japan that the EU got for reciprocal",
  },
];

const capabilitiesComingSoon: BulletPoint[] = [
  {
    title: "Specify Country of Smelt / Cast for Section 232 Metals",
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
      "Yes, you can select any # of countries and see how the rates stack up between them for a given 10-digit HTS code",
  },
  {
    topic: "Do you include tariff stacking?",
    details:
      "Absolutely, we do our best to ensure that the most up to date stacking rules are applied in all cases",
  },
  {
    topic: "Do you include Free Trade Agreements?",
    details:
      "Yes, for any given country you can see if there are FTA's that might be applicable and see how duty is impacted when applied",
  },
  {
    topic: "Do you include exceptions?",
    details:
      "Yes, for any given code & country combination you can see if there are any exceptions that might be applicable and toggle them on if you think they're applicable to see how they impact duty.",
  },
  {
    topic:
      "Do you identify section 232 metals and apply tariffs to the base article and metal content separately?",
    details:
      "Yes, if the HTS code you are looking at falls under the inclusions for a 232 metal, we create a separate tariff line item just for the metal content and update the tariffs that apply for the base article (if applicable). One current limitation we have is not allowing the addition of 232 metal tariffs to an item that has not been directly marked. For example a piece of furniture that has steel, aluminum, and copper but isn't marked as such in the HTS cannot currently be separated out into the different line items based on the different metal contents.",
  },
  {
    topic:
      "Do you support providing a country or smelt or cast for section 232 metals?",
    details:
      "Not currently, however we are currently working on adding this in.",
  },
  {
    topic: "Do you support Anti-Dumping or Countervailing Duties?",
    details:
      "Not currently, however we are considering adding support for these in the future. For now you are best of talking to a licensed customs broker to see if these might apply.",
  },
  {
    topic:
      "Do you support providing a customs value to see total landed costs?",
    details:
      "Not currently, however we are considering adding support for this in the future.",
  },
  {
    topic: "Do you support applying Chapter 98 Exclusions?",
    details:
      "Not currently, however you can easily open all notes and elements for chapter 98 to see if any exclusions apply. We are considering adding support for this in the future.",
  },
];

const TariffFAQ = ({ topic, details }: { topic: string; details: string }) => {
  return (
    <div className="flex flex-col">
      <h3 className="font-medium text-base-content text-xl">{topic}</h3>
      <p className="text-base-content/70">{details}</p>
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
            Tariff Coverage & Capabilities
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
              name="Currently Supported"
              description="Tariffs & capabilities that are currently supported by our system."
              type={FeatureStatus.COVERED}
              tariffs={tariffsSupported}
              capabilities={capabilitiesSupported}
            />

            {/* Coming Soon Tariffs */}
            <TariffCoverageSection
              name="Coming Soon"
              description="Tariffs & capabilities in development that will be available soon."
              type={FeatureStatus.COMING_SOON}
              tariffs={tariffsComingSoon}
              capabilities={capabilitiesComingSoon}
            />
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-5xl mx-auto p-6 my-6">
          <h2 className="text-xl md:text-3xl font-semibold text-base-content mb-8">
            Frequently Asked Questions
          </h2>
          <div className="grid gap-8">
            {tariffFAQs.map((faq) => (
              <TariffFAQ key={faq.topic} {...faq} />
            ))}
            <div>
              <h3 className="font-medium text-base-content mb-2 text-xl">
                What if I see something missing?
              </h3>
              <p className="text-base-content/70">
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
              <h3 className="font-medium text-base-content mb-2 text-xl">
                What if I see something wrong?
              </h3>
              <p className="text-base-content/70">
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

        <Footer />
      </div>
    </main>
  );
}
