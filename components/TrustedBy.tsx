// Company names data
const companies = [
  "Kuehne + Nagel",
  "DSV",
  "Border Brokers",
  "Harren Group",
  "JORI Logistics",
  "Ingersoll Rand",
  "GCB USA",
  "True North Brokerage",
];

// Company name component
const CompanyName = ({ company }: { company: (typeof companies)[0] }) => (
  <div className="flex items-center justify-center h-12">
    <div className="text-primary text-sm font-medium text-center whitespace-nowrap border border-neutral-600/30 rounded-lg px-4 py-2 bg-neutral-800/50 hover:bg-neutral-700/50 transition-all duration-300 cursor-default">
      {company}
    </div>
  </div>
);

const TrustedBy = () => {
  return (
    <section className="py-8 bg-black">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center flex flex-col gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Trusted by Industry Leaders
            </h2>
            <p className="text-sm sm:text-base text-neutral-300 max-w-7xl mx-auto">
              Join hundreds of customs brokers & importers who use HTS Hero to
              make tariffs & classification a breeze
              {/* who rely on HTS Hero to boost their classifications
              and get tariff insights. */}
            </p>
          </div>
          <div className="relative overflow-hidden">
            <div className="flex flex-wrap justify-center gap-2">
              {/* Company names */}
              {companies.map((company, index) => (
                <CompanyName key={`first-${index}`} company={company} />
              ))}
            </div>
          </div>
        </div>

        {/* Stats Section */}
        {/* <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="bg-base-100 rounded-2xl p-6 shadow-lg">
            <div className="text-3xl font-bold text-primary mb-2">500+</div>
            <div className="text-base-content/70">Active Users</div>
          </div>
          <div className="bg-base-100 rounded-2xl p-6 shadow-lg">
            <div className="text-3xl font-bold text-primary mb-2">50K+</div>
            <div className="text-base-content/70">
              Classifications Completed
            </div>
          </div>
          <div className="bg-base-100 rounded-2xl p-6 shadow-lg">
            <div className="text-3xl font-bold text-primary mb-2">99.2%</div>
            <div className="text-base-content/70">Accuracy Rate</div>
          </div>
        </div> */}
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-scroll {
          animation: scroll 30s linear infinite;
        }

        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
};

export default TrustedBy;
