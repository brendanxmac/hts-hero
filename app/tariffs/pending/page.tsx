import config from "@/config";
import { getSEOTags } from "../../../libs/seo";
import { PendingTariffsList } from "../../../components/UpcomingTariffsList";

export const metadata = getSEOTags({
  title: `Pending Tariffs | ${config.appName}`,
  canonicalUrlRelative: "/tariffs/pending",
});

export default function Home() {
  return (
    <main className="min-h-full bg-base-100 overflow-hidden">
      <div className="h-full overflow-y-auto">
        {/* Hero Header Section */}
        <div className="relative overflow-hidden bg-base-100 pt-8 pb-6 md:pt-12 md:pb-8">
          {/* Background decorative elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-24 -left-24 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute -top-24 -right-24 w-72 h-72 bg-secondary/10 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 flex flex-col w-full max-w-7xl mx-auto px-6">
            {/* Section label */}
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-block w-8 h-px bg-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-widest">
                Tariff Intelligence
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-base-content mb-4">
              Pending Tariffs Tracker
            </h1>
            <p className="text-base lg:text-lg text-base-content/70 max-w-3xl leading-relaxed">
              Stay informed about upcoming tariff announcements and their
              potential impact on your imports. Track the status of proposed
              tariffs from initial mention through investigation to publication.
              See the full history & more details{" "}
              <a
                href="https://www.tradecomplianceresourcehub.com/2025/08/25/trump-2-0-tariff-tracker/"
                className="text-primary font-medium hover:underline"
              >
                here
              </a>
            </p>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-7xl mx-auto pb-8">
          <PendingTariffsList hideHeading />
        </div>
      </div>
    </main>
  );
}
