import Link from "next/link";

enum TariffStatus {
  MENTIONED = "Mentioned",
  INVESTIGATION = "Investigation",
  PENDING_PUBLICATION = "Pending Publication",
  PUBLISHED = "Published",
}

interface TariffAnnouncement {
  name: string;
  date: Date;
  rate?: string;
  status: TariffStatus;
}

interface Props {
  hideHeading?: boolean;
}

export const UpcomingTariffsList = ({ hideHeading }: Props) => {
  const tariffAnnouncements: TariffAnnouncement[] = [
    {
      name: "Digital Services Tax Reciprocal",
      date: new Date(2025, 7, 25), // August 25, 2025
      status: TariffStatus.MENTIONED,
    },
    {
      name: "Furniture",
      date: new Date(2025, 7, 22), // August 22, 2025
      status: TariffStatus.MENTIONED,
    },
    {
      name: "Wind Turbines & Parts",
      date: new Date(2025, 7, 21), // August 21, 2025
      status: TariffStatus.INVESTIGATION,
    },
    {
      name: "Polysilicon & Derivatives",
      date: new Date(2025, 6, 14), // July 14, 2025
      status: TariffStatus.INVESTIGATION,
    },
    {
      name: "Brazil Section 301 Investigation",
      date: new Date(2025, 6, 18), // July 18, 2025
      status: TariffStatus.INVESTIGATION,
    },
    {
      name: "Semiconductors & Equipment",
      date: new Date(2025, 7, 6), // August 6, 2025
      rate: "100%",
      status: TariffStatus.INVESTIGATION,
    },
    {
      name: "iPhones",
      date: new Date(2025, 4, 23), // May 23, 2025
      rate: "25%",
      status: TariffStatus.MENTIONED,
    },
    {
      name: "Aircraft & Jet Engine Parts",
      date: new Date(2025, 4, 13), // May 13, 2025
      status: TariffStatus.INVESTIGATION,
    },
    {
      name: "Trucks & Truck Parts",
      date: new Date(2025, 3, 22), // April 22, 2025
      status: TariffStatus.INVESTIGATION,
    },
    {
      name: "Maritime Cargo Handling Equipment",
      date: new Date(2025, 3, 9), // April 9, 2025
      rate: "20-100%",
      status: TariffStatus.INVESTIGATION,
    },
    {
      name: "Agricultural Products",
      date: new Date(2025, 3, 2), // April 2, 2025
      status: TariffStatus.MENTIONED,
    },
    {
      name: "Lumber / Timber",
      date: new Date(2025, 2, 3), // March 3, 2025
      rate: "25%",
      status: TariffStatus.INVESTIGATION,
    },
    {
      name: "Pharmaceuticals & Ingredients",
      date: new Date(2025, 6, 8), // July 2025
      rate: "200%",
      status: TariffStatus.INVESTIGATION,
    },
    {
      name: "Critical Minerals",
      date: new Date(2025, 3, 15), // April 15, 2025
      status: TariffStatus.INVESTIGATION,
    },
    {
      name: "Unmanned Aircraft Systems & Parts",
      date: new Date(2025, 6, 14), // July 14th, 2025
      status: TariffStatus.INVESTIGATION,
    },
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  const getStatusStyles = (status: TariffStatus) => {
    switch (status) {
      case TariffStatus.MENTIONED:
        return {
          bg: "bg-info/20",
          text: "text-info",
          border: "border-info/30",
          dot: "bg-info",
        };
      case TariffStatus.INVESTIGATION:
        return {
          bg: "bg-warning/20",
          text: "text-warning",
          border: "border-warning/30",
          dot: "bg-warning",
        };
      case TariffStatus.PENDING_PUBLICATION:
        return {
          bg: "bg-orange-500/20",
          text: "text-orange-500",
          border: "border-orange-500/30",
          dot: "bg-orange-500",
        };
      case TariffStatus.PUBLISHED:
        return {
          bg: "bg-success/20",
          text: "text-success",
          border: "border-success/30",
          dot: "bg-success",
        };
    }
  };

  const getStatusBadge = (status: TariffStatus) => {
    const style = getStatusStyles(status);

    return (
      <div
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold ${style.bg} ${style.text} ${style.border} border`}
      >
        <div className={`w-2 h-2 rounded-full ${style.dot}`}></div>
        {status}
      </div>
    );
  };

  return (
    <section
      className={`flex justify-center items-center w-full bg-base-200 text-base-content px-6  ${
        hideHeading ? "" : "lg:py-16"
      }`}
    >
      <div className="w-full flex flex-col max-w-7xl lg:min-w-5xl gap-2 sm:gap-4">
        {!hideHeading && (
          <div className="text-center">
            <div className="flex flex-col -space-y-4 md:space-y-0">
              <h1 className="text-white font-extrabold text-2xl sm:text-3xl md:text-5xl lg:text-6xl tracking-tight max-w-5xl mx-auto leading-loose">
                More Tariffs are Coming,
              </h1>
              <h1 className="text-white font-extrabold text-2xl sm:text-3xl md:text-5xl lg:text-6xl tracking-tight max-w-5xl mx-auto leading-loose">
                {/* Be{" "} */}
                <span className="bg-primary text-base-200 px-3 py-0 rounded-md">
                  Automate
                </span>{" "}
                your Impact Checks
              </h1>
            </div>
            <p className="text-sm md:text-lg text-neutral-300 max-w-5xl mx-auto mt-2 md:mt-6">
              {/* Weekly announcements and ongoing investigations seem to indicate
            there is much more on the way */}
              Manually checking your tariff impacts just doesn&apos;t cut it
              anymore.
              {/* Get notified when your imports are affected by new tariffs. */}
            </p>
            <div className="flex justify-center mt-4">
              <Link
                className="btn btn-wide btn-primary"
                href={"/tariffs/impact-checker"}
              >
                Automate my Checks
              </Link>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
          {tariffAnnouncements.map((tariff, index) => (
            <div
              key={index}
              className="group bg-base-100 rounded-xl shadow-lg hover:shadow-2xl hover:bg-base-200/50 transition-all duration-100 p-6 border border-base-content/10 hover:border-base-content/20"
            >
              {/* Header Section */}
              <div className="mb-6">
                <h3 className="md:text-xl font-bold text-gray-100 leading-tight mb-3 transition-colors">
                  {tariff.name}
                </h3>
                <div className="flex items-center justify-between">
                  {getStatusBadge(tariff.status)}
                  <div className="flex items-center text-sm text-base-content/60">
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="font-medium">
                      {tariff.date.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Rate Section */}
              <div className="pt-4 border-t border-base-content/10">
                <div className="flex items-center justify-between">
                  <span className="text-base-content/60 text-sm font-medium">
                    Tariff Rate
                  </span>
                  <div className="text-right">
                    {tariff.rate ? (
                      <span className="text-lg font-bold text-base-content group-hover:text-secondary transition-colors">
                        {tariff.rate}
                      </span>
                    ) : (
                      <span className="font-semibold text-base-content/50">
                        TBD
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-4">
          <p className="text-sm text-base-content/60 max-w-3xl mx-auto">
            Tariff announcements are subject to change. &quot;TBD&quot;
            indicates rates are unknown or being determined.
          </p>
          <a
            href="https://www.tradecomplianceresourcehub.com/2025/08/25/trump-2-0-tariff-tracker/"
            className="text-xs link link-primary text-base-content/70"
          >
            See source / all tariff announcements
          </a>
        </div>
      </div>
    </section>
  );
};
