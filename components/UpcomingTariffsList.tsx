import Link from "next/link";

enum TariffStatus {
  MENTIONED = "Mentioned",
  INVESTIGATION = "Under Investigation",
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

export const PendingTariffsList = ({ hideHeading }: Props) => {
  const tariffAnnouncements: TariffAnnouncement[] = [
    {
      name: "Medium & Heavy Duty Vehicles",
      date: new Date(2025, 10, 1), // November 1, 2025
      status: TariffStatus.PUBLISHED,
    },
    {
      name: "Robotics & Industrial Machinery",
      date: new Date(2025, 8, 24), // September 24, 2025
      status: TariffStatus.INVESTIGATION,
    },
    {
      name: "Personal Protective Equipment, Medical Consumables & Equipment",
      date: new Date(2025, 8, 24), // September 24, 2025
      status: TariffStatus.INVESTIGATION,
    },
    {
      name: "Taxed Digital Service Penalty",
      date: new Date(2025, 7, 25), // August 25, 2025
      status: TariffStatus.MENTIONED,
    },
    {
      name: "Wooden Furniture",
      date: new Date(2025, 8, 29), // September 29, 2025
      status: TariffStatus.PUBLISHED,
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
    // {
    //   name: "Trucks & Truck Parts",
    //   date: new Date(2025, 8, 25), // September 25, 2025
    //   rate: "25%",
    //   status: TariffStatus.PENDING_PUBLICATION,
    // },
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
      date: new Date(2025, 8, 29), // March 3, 2025
      rate: "25%",
      status: TariffStatus.PUBLISHED,
    },
    {
      name: "Pharmaceuticals & Ingredients",
      date: new Date(2025, 8, 25), // September 25, 2025
      rate: "100%",
      status: TariffStatus.PENDING_PUBLICATION,
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
          bg: "bg-info/10",
          text: "text-info",
          border: "border-info/20",
          dot: "bg-info",
        };
      case TariffStatus.INVESTIGATION:
        return {
          bg: "bg-warning/10",
          text: "text-warning",
          border: "border-warning/20",
          dot: "bg-warning",
        };
      case TariffStatus.PENDING_PUBLICATION:
        return {
          bg: "bg-orange-500/10",
          text: "text-orange-500",
          border: "border-orange-500/20",
          dot: "bg-orange-500",
        };
      case TariffStatus.PUBLISHED:
        return {
          bg: "bg-success/10",
          text: "text-success",
          border: "border-success/20",
          dot: "bg-success",
        };
    }
  };

  const getStatusBadge = (status: TariffStatus) => {
    const style = getStatusStyles(status);

    return (
      <div
        className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text} ${style.border} border`}
      >
        <div className={`w-1.5 h-1.5 rounded-full ${style.dot}`}></div>
        {status}
      </div>
    );
  };

  return (
    <section
      id="pending-tariffs"
      className={`flex justify-center items-center w-full bg-base-100 text-base-content px-6 ${
        hideHeading ? "py-2" : "py-12 lg:py-20"
      }`}
    >
      <div className="w-full flex flex-col max-w-7xl gap-4 sm:gap-6">
        {!hideHeading && (
          <div className="text-center mb-8">
            {/* Section label */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="inline-block w-8 h-px bg-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-widest">
                Stay Informed
              </span>
              <span className="inline-block w-8 h-px bg-primary" />
            </div>

            <h2 className="font-bold text-3xl sm:text-4xl md:text-5xl tracking-tight text-base-content mb-4">
              More Tariffs are Coming
            </h2>
            <p className="text-base md:text-lg text-base-content/70 max-w-2xl mx-auto mb-6">
              Quickly knowing your impacts can mean big savings
            </p>
            <Link
              href="/about/tariffs#pricing"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-sm bg-primary text-white hover:bg-primary/90 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <span>Be Prepared Today</span>
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {tariffAnnouncements.map((tariff, index) => (
            <div
              key={index}
              className="group relative bg-gradient-to-br from-base-100 to-base-200/50 rounded-xl p-5 border border-base-content/10 hover:border-primary/30 transition-all duration-200 hover:shadow-lg"
            >
              {/* Decorative gradient on hover */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />

              <div className="relative z-10">
                {/* Header Section */}
                <div className="mb-4">
                  <h3 className="text-base md:text-lg font-semibold text-base-content leading-snug mb-3 group-hover:text-primary transition-colors">
                    {tariff.name}
                  </h3>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    {getStatusBadge(tariff.status)}
                    <div className="flex items-center text-xs text-base-content/50">
                      <svg
                        className="w-3.5 h-3.5 mr-1.5"
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
                <div className="pt-3 border-t border-base-content/5">
                  <div className="flex items-center justify-between">
                    <span className="text-base-content/50 text-xs font-medium">
                      Possible Rate
                    </span>
                    <div className="text-right">
                      {tariff.rate ? (
                        <span className="text-base font-bold text-base-content group-hover:text-primary transition-colors">
                          {tariff.rate}
                        </span>
                      ) : (
                        <span className="text-sm font-medium text-base-content/40">
                          TBD
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {hideHeading && (
          <div className="text-center mt-6 pt-6 border-t border-base-content/5">
            <p className="text-sm text-base-content/50 max-w-3xl mx-auto mb-2">
              Tariff announcements are subject to change. &quot;TBD&quot;
              indicates rates are unknown or being determined.
            </p>
            <a
              href="https://www.tradecomplianceresourcehub.com/2025/08/25/trump-2-0-tariff-tracker/"
              className="text-xs font-medium text-primary hover:underline"
            >
              See source / all tariff announcements →
            </a>
          </div>
        )}
      </div>
    </section>
  );
};
