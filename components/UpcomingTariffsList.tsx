interface TariffAnnouncement {
  name: string;
  date: Date;
  rate?: string;
  status:
    | "Announced"
    | "Published"
    | "Public Comment"
    | "Draft"
    | "Implemented";
}

export const UpcomingTariffsList = () => {
  const tariffAnnouncements: TariffAnnouncement[] = [
    {
      name: "Digital Services Tax Reciprocal",
      date: new Date(2025, 7, 25), // August 25, 2025
      status: "Announced" as const,
    },
    {
      name: "Furniture",
      date: new Date(2025, 7, 22), // August 22, 2025
      status: "Draft" as const,
    },
    {
      name: "Wind Turbines & their parts",
      date: new Date(2025, 7, 21), // August 21, 2025
      status: "Published" as const,
    },
    {
      name: "Polysilicon & Derivatives",
      date: new Date(2025, 6, 14), // July 14, 2025
      status: "Implemented" as const,
    },
    {
      name: "Semiconductors & Equipment to Manufacture",
      date: new Date(2025, 7, 6), // August 6, 2025
      rate: "100%",
      status: "Public Comment" as const,
    },
    {
      name: "iPhones",
      date: new Date(2025, 4, 23), // May 23, 2025
      rate: "25%",
      status: "Implemented" as const,
    },
    {
      name: "Commercial Aircraft & Jet Engine Parts",
      date: new Date(2025, 4, 13), // May 13, 2025
      status: "Draft" as const,
    },
    {
      name: "Trucks & Truck parts",
      date: new Date(2025, 3, 22), // April 22, 2025
      status: "Published" as const,
    },
    {
      name: "Maritime Cargo Handling Equipment",
      date: new Date(2025, 3, 9), // April 9, 2025
      rate: "20-100%",
      status: "Announced" as const,
    },
    {
      name: "Agricultural Products",
      date: new Date(2025, 3, 2), // April 2, 2025
      status: "Public Comment" as const,
    },
    {
      name: "Lumber / Timber",
      date: new Date(2025, 2, 3), // March 3, 2025
      rate: "25%",
      status: "Implemented" as const,
    },
    {
      name: "Pharmaceuticals, ingredients, & derivatives",
      date: new Date(2025, 7, 18), // February 2025
      rate: "200%",
      status: "Published" as const,
    },
    {
      name: "Critical Minerals",
      date: new Date(2025, 4, 15), // April 15, 2025
      status: "Draft" as const,
    },
    {
      name: "Unmanned Aircraft Systems & their parts",
      date: new Date(2025, 7, 14), // July 14th, 2025
      status: "Announced" as const,
    },
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  const getStatusBadge = (
    status:
      | "Announced"
      | "Published"
      | "Public Comment"
      | "Draft"
      | "Implemented"
  ) => {
    const statusStyles = {
      Announced: {
        bg: "bg-blue-500/15",
        text: "text-blue-400",
        border: "border-blue-500/25",
        dot: "bg-blue-400",
      },
      Published: {
        bg: "bg-green-500/15",
        text: "text-green-400",
        border: "border-green-500/25",
        dot: "bg-green-400",
      },
      "Public Comment": {
        bg: "bg-yellow-500/15",
        text: "text-yellow-400",
        border: "border-yellow-500/25",
        dot: "bg-yellow-400",
      },
      Draft: {
        bg: "bg-gray-500/15",
        text: "text-gray-400",
        border: "border-gray-500/25",
        dot: "bg-gray-400",
      },
      Implemented: {
        bg: "bg-purple-500/15",
        text: "text-purple-400",
        border: "border-purple-500/25",
        dot: "bg-purple-400",
      },
    };

    const style = statusStyles[status];

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
    <section className="flex justify-center items-center w-full bg-base-200 text-base-content px-6 py-10 lg:py-16">
      <div className="w-full flex flex-col max-w-7xl lg:min-w-5xl gap-4 sm:gap-8">
        <div className="text-center">
          <h1 className="text-white font-extrabold text-3xl md:text-5xl lg:text-6xl tracking-tight md:-mb-4 max-w-5xl mx-auto">
            More Tariffs are Coming
          </h1>
          <p className="text-sm md:text-lg text-neutral-300 leading-relaxed max-w-5xl mx-auto mt-4">
            Weekly announcements and ongoing investigations indicate there is
            much more on the way
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-12">
          {tariffAnnouncements.map((tariff, index) => (
            <div
              key={index}
              className="group bg-gray-900/80 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-2xl hover:bg-gray-900/90 transition-all duration-100 p-6 border border-gray-600/40 hover:border-gray-500/60"
            >
              {/* Header Section */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white leading-tight mb-3 group-hover:text-gray-100 transition-colors">
                  {tariff.name}
                </h3>
                <div className="flex items-center justify-between">
                  {getStatusBadge(tariff.status)}
                  <div className="flex items-center text-sm text-gray-400">
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
              <div className="pt-4 border-t border-gray-700/50">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm font-medium">
                    Tariff Rate
                  </span>
                  <div className="text-right">
                    {tariff.rate ? (
                      <span className="text-lg font-bold text-white group-hover:text-red-500 transition-colors">
                        {tariff.rate}
                      </span>
                    ) : (
                      <span className="font-semibold text-gray-500">TBD</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-sm text-gray-400 max-w-3xl mx-auto">
            Tariff announcements are subject to change. "TBD" indicates rates
            are unknowwn or being determined.
          </p>
          <a
            href="https://www.tradecomplianceresourcehub.com/2025/08/25/trump-2-0-tariff-tracker/"
            className="text-xs link text-gray-400"
          >
            See source / all tariff announcements
          </a>
        </div>
      </div>
    </section>
  );
};
