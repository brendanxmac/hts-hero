import config from "@/config";
import { getSEOTags } from "../../../libs/seo";
import { PendingTariffsList } from "../../../components/UpcomingTariffsList";
import Link from "next/link";

export const metadata = getSEOTags({
  title: `Pending Tariffs | ${config.appName}`,
  canonicalUrlRelative: "/tariffs/pending",
});

export default function Home() {
  return (
    <main className="h-full bg-base-300 overflow-hidden">
      <div className="h-full overflow-y-auto">
        {/* Header Section */}
        <div className="flex flex-col w-full max-w-7xl mx-auto px-6 pt-10">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
            Pending Tariffs Tracker
          </h1>
          <p className="text-sm lg:text-lg text-base-content max-w-7xl">
            Stay informed about upcoming tariff announcements and their
            potential impact on your imports. Track the status of proposed
            tariffs from initial mention through investigation to publication.
            See the full history & more details{" "}
            <a
              href="https://www.tradecomplianceresourcehub.com/2025/08/25/trump-2-0-tariff-tracker/"
              className="link link-primary"
            >
              here
            </a>
          </p>

          {/* <div className="w-full flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center mt-6 -mb-10 px-6">
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Pending Tariffs
            </h2>
            <Link
              href="/about/tariffs"
              className="shrink-0 btn btn-sm btn-primary"
            >
              Check Tariff Impacts on Your Imports
            </Link>
          </div> */}
        </div>

        {/* Content Section */}
        <div className="max-w-7xl mx-auto pb-2">
          <PendingTariffsList hideHeading />
        </div>
      </div>
    </main>
  );
}
