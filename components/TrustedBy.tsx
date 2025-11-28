// Company names data
const companies = [
  "Amazon",
  "Kuehne + Nagel",
  "DSV",
  "Border Brokers",
  "Harren Group",
  "JORI Logistics",
  "Ingersoll Rand",
  "True North Brokerage",
];

// Company name component
const CompanyName = ({ company }: { company: (typeof companies)[0] }) => (
  <div className="flex items-center justify-center">
    <div className="text-base-content/80 font-medium text-center border border-base-content/20 bg-base-200/50 rounded-lg whitespace-nowrap px-4 py-2 transition-all duration-300 cursor-default hover:border-base-content/40 hover:bg-base-200">
      {company}
    </div>
  </div>
);

// Individual testimonials with profile images
const individualTestimonials = [
  {
    role: "Vice President, LCB",
    company: "DEX Global",
    quote: "I don't know how you do it, but I am glad I have my HTS Hero!",
  },
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

// Individual testimonial component
const IndividualTestimonial = ({
  testimonial,
}: {
  testimonial: (typeof individualTestimonials)[0];
}) => (
  <div className="flex flex-col items-center text-center w-full sm:flex-1 sm:max-w-sm lg:max-w-md bg-base-200/30 backdrop-blur-sm rounded-xl p-6 border border-base-content/20 transition-all duration-300 hover:border-base-content/30 hover:shadow-lg">
    <blockquote className="sm:text-lg text-base text-base-content/90 mb-4 font-bold leading-relaxed">
      &quot;{testimonial.quote}&quot;
    </blockquote>
    <div className="text-primary/80 text-xs font-semibold uppercase tracking-wide">
      {testimonial.role}, {testimonial.company}
    </div>
  </div>
);

interface Props {
  showTestimonials?: boolean;
}

const TrustedBy = ({ showTestimonials = true }: Props) => {
  return (
    <section className="py-8 md:py-14 bg-base-100">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">
              Trusted by{" "}
              <span className="underline decoration-primary">
                Industry Leaders
              </span>
            </h2>
            <p className="text-base sm:text-lg max-w-7xl mx-auto leading-relaxed">
              Join hundreds of trade professionals who use HTS Hero to make
              tariffs & classification a breeze
            </p>
          </div>
          <div className="relative overflow-hidden">
            <div className="flex flex-wrap items-center justify-center gap-3">
              {/* Company names with separators */}
              {companies.map((company, index) => (
                <CompanyName key={`company-${index}`} company={company} />
              ))}
            </div>
          </div>
          {/* Individual Testimonials Section - Full width below other content */}
          {showTestimonials && (
            <section className="w-full">
              <div className="max-w-7xl mx-auto">
                <div className="flex flex-wrap justify-center items-stretch gap-6 md:gap-8">
                  {individualTestimonials.map((testimonial, index) => (
                    <IndividualTestimonial
                      key={index}
                      testimonial={testimonial}
                    />
                  ))}
                </div>
              </div>
            </section>
          )}
        </div>
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
