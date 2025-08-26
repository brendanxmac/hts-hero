import config from "@/config";
import { getSEOTags } from "../../../libs/seo";
import { UpcomingTariffsList } from "../../../components/UpcomingTariffsList";
import Footer from "../../../components/Footer";
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
        <div className="flex flex-col gap-2 w-full max-w-7xl mx-auto px-6 pt-10">
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
            Pending Tariffs
          </h1>
          <p className="text-sm lg:text-lg text-base-content max-w-7xl">
            Stay informed about upcoming tariff announcements and their
            potential impact on your imports. Track the status of proposed
            tariffs from initial mention through investigation to publication.
            See the full history & more details{" "}
            <a
              href="https://wadhurs.com/pending-tariffs"
              className="link link-primary"
            >
              here
            </a>
          </p>
          <div className="flex flex-col gap-2 mt-4">
            <p className="font-bold">
              To see if your imports are impacted by any new tariffs click the
              button below:
            </p>
            <Link
              href="/about/tariffs"
              className="btn btn-sm btn-primary btn-wide"
            >
              Check my Imports
            </Link>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-7xl mx-auto px-6 pt-6 pb-2">
          <UpcomingTariffsList hideHeading />
        </div>
      </div>
    </main>
  );
}
