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

// Individual testimonials with profile images
const individualTestimonials = [
  {
    role: "Director of Operations & Compliance, LCB",
    company: "Harren Group",
    quote:
      "I was really pleased with the AI recommendation – it was very intuitive and caught something I hadn’t seen earlier",
  },
  {
    role: "VP Forwarding & Customs Brokerage",
    company: "Logisteed America",
    quote:
      "Been loving using htshero. Excellent tool and fun watching you develop this.",
  },
];

// Company name component
const CompanyName = ({ company }: { company: (typeof companies)[0] }) => (
  <div className="flex items-center justify-center h-12">
    <div className="text-white text-sm font-semibold text-center whitespace-nowrap border-0 rounded-lg px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-default">
      {company}
    </div>
  </div>
);

// Individual testimonial component
const IndividualTestimonial = ({
  testimonial,
}: {
  testimonial: (typeof individualTestimonials)[0];
}) => (
  <div className="flex flex-col items-center text-center max-w-sm mx-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50">
    <blockquote className="text-sm text-gray-700 dark:text-gray-200 mb-3 italic">
      "{testimonial.quote}"
    </blockquote>
    <div className="text-gray-500 dark:text-gray-400 text-xs font-medium">
      {testimonial.role}, {testimonial.company}
    </div>
  </div>
);

const TrustedBy = () => {
  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12 flex flex-col gap-4">
          <div>
            <h2 className="text-3xl md:text-5xl font-bold text-primary mb-4">
              Trusted by Industry Leaders
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Join hundreds of customs brokers, importers, and trade
              professionals who rely on HTS Hero to boost their classifications
              and get tariff insights.
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

        {/* Individual Testimonials Section */}
        <div className="flex flex-wrap justify-center items-start gap-8">
          {individualTestimonials.map((testimonial, index) => (
            <IndividualTestimonial key={index} testimonial={testimonial} />
          ))}
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
