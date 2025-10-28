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
  <div className="flex items-center justify-center">
    <div className="text-neutral-400 text-center border border-neutral-500/50 rounded-md whitespace-nowrap px-3 py-1.5 transition-all duration-300 cursor-default">
      {company}
    </div>
  </div>
);

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
  // {
  //   role: "Director of Customs Operations",
  //   company: "Nicole",
  //   quote: "This is saving our team so much time! thank you",
  // },
];

// Individual testimonial component
const IndividualTestimonial = ({
  testimonial,
}: {
  testimonial: (typeof individualTestimonials)[0];
}) => (
  <div className="flex flex-col items-center text-center w-full sm:flex-1 sm:max-w-sm lg:max-w-md bg-neutral-800/40 backdrop-blur-sm rounded-xl p-4 border border-neutral-500/50 transition-all duration-300">
    <blockquote className="sm:text-lg text-gray-100 mb-3">
      &quot;{testimonial.quote}&quot;
    </blockquote>
    <div className="text-neutral-400 text-xs font-medium">
      {testimonial.role}, {testimonial.company}
    </div>
  </div>
);

interface Props {
  showTestimonials?: boolean;
}

const TrustedBy = ({ showTestimonials = true }: Props) => {
  return (
    <section className="py-8 md:py-14 bg-base-300">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              Trusted by Industry Leaders
            </h2>
            <p className="text-sm sm:text-base text-neutral-300 max-w-7xl mx-auto">
              Join hundreds of customs brokers & importers who use HTS Hero to
              make tariffs & classification a breeze
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
        </div>

        {/* Individual Testimonials Section - Full width below other content */}
        {showTestimonials && (
          <section className="w-full py-10">
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
