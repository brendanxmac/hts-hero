// Company names data
// const companies = [
//   "Amazon",
//   "Kuehne + Nagel",
//   "DSV",
//   "Border Brokers",
//   "Harren Group",
//   "JORI Logistics",
//   "Ingersoll Rand",
//   "True North Brokerage",
// ];

// Individual testimonials
const testimonials = [
  {
    role: "Vice President, LCB",
    company: "DEX Global",
    quote: "I don't know how you do it, but I am glad I have my HTS Hero!",
  },
  {
    role: "Director of Operations & Compliance, LCB",
    company: "Harren Group",
    quote: "It was very intuitive and caught something I hadn't seen earlier",
  },
  {
    role: "VP Forwarding & Customs Brokerage",
    company: "Logisteed America",
    quote:
      "Been loving using htshero. Excellent tool and fun watching you develop this.",
  },
];

interface TestimonialsStripProps {
  showCompanies?: boolean;
  showTestimonials?: boolean;
  maxCompanies?: number;
}

export function TestimonialsStrip({
  showCompanies = true,
  showTestimonials = true,
  maxCompanies = 6,
}: TestimonialsStripProps) {
  return (
    <div className="w-full max-w-6xl mx-auto">
      {showTestimonials && (
        <div className="w-full flex flex-col">
          {/* Title Section */}
          <div className="self-center text-center flex items-center gap-1.5 sm:gap-2 mb-3 sm:mb-8">
            <span className={`inline-block w-8 sm:w-12 h-px bg-primary`} />
            <span
              className={`text-sm md:text-base font-semibold text-primary uppercase tracking-widest`}
            >
              Loved by Manufacturers, Brokerages, & Logistics Teams
            </span>
            <span className={`inline-block w-8 sm:w-12 h-px bg-primary`} />
          </div>

          {/* Testimonials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6 items-center">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="group relative bg-gradient-to-br from-base-100 via-base-100 to-primary/5 backdrop-blur-sm rounded-xl px-4 py-3 sm:px-6 sm:py-5 border-2 border-base-content/10 hover:border-secondary/40 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                {/* Decorative quote mark */}
                <div className="absolute top-3 left-3 sm:top-4 sm:left-4 text-2xl sm:text-4xl font-serif text-secondary/20 leading-none">
                  &ldquo;
                </div>

                <blockquote className="text-base-content leading-relaxed mb-3 sm:mb-4 relative z-10 pt-1 sm:pt-2">
                  {testimonial.quote}
                </blockquote>

                <div className="flex items-center gap-2 pt-2 sm:pt-3 border-t border-base-content/10">
                  <div className="flex-1 min-w-0">
                    {/* <div className="text-xs font-semibold text-base-content/70 truncate">
                      {testimonial.role}
                    </div> */}
                    <div className="text-xs font-medium text-primary mt-0.5">
                      {testimonial.company}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Company Logos Strip */}
      {showCompanies && (
        <div
          className={
            showTestimonials
              ? "mt-8 pt-6 border-t border-base-content/5"
              : undefined
          }
        >
          {/* <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            <span className="text-xs font-medium text-base-content/40 uppercase tracking-wider">
              Trusted by Trade Professionals At
            </span>
            {companies.slice(0, maxCompanies).map((company, index) => (
              <span
                key={`company-${index}`}
                className="text-sm font-medium text-base-content/50 hover:text-base-content/70 transition-colors"
              >
                {company}
              </span>
            ))}
          </div> */}
          {/* Social Credibility */}
          <div className="flex items-center justify-center gap-2 mb-10 text-base-content/60">
            <span className="text-amber-400 text-lg">★</span>
            <p className="text-sm">
              Trusted by professionals at{" "}
              <span className="font-semibold text-base-content/80">K+N</span>,{" "}
              <span className="font-semibold text-base-content/80">DSV</span>,{" "}
              <span className="font-semibold text-base-content/80">
                Amazon,
              </span>{" "}
              and many more...
            </p>
            <span className="text-amber-400 text-lg">★</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default TestimonialsStrip;
