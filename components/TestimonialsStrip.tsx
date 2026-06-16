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
    accent: "primary" as const,
  },
  {
    role: "Director of Operations & Compliance, LCB",
    company: "Harren Group",
    quote: "It was very intuitive and caught something I hadn't seen earlier.",
    accent: "secondary" as const,
  },
  {
    role: "VP Forwarding & Customs Brokerage",
    company: "Logisteed America",
    quote:
      "Been loving using HTS Hero. Excellent tool and fun watching you develop this.",
    accent: "primary" as const,
  },
];

// Build initials from a company name, e.g. "DEX Global" -> "DG"
const getInitials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");

const avatarGradients: Record<"primary" | "secondary", string> = {
  primary: "from-primary to-secondary",
  secondary: "from-secondary to-primary",
};

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
    <div className="w-full max-w-7xl mx-auto">
      {showTestimonials && (
        <div className="w-full flex flex-col">
          {/* Title Section */}
          <div className="text-center mb-8 sm:mb-12">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-semibold uppercase tracking-widest mb-4">
              <span className="text-amber-400 not-italic">★★★★★</span>
              Loved by Trade Pros
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
              Don&apos;t just take our word for it
            </h2>
            <p className="text-sm sm:text-base text-base-content/60 max-w-xl mx-auto mt-3">
              Customs brokers, importers, and logistics teams rely on HTS Hero
              every day. Here&apos;s what they have to say.
            </p>
          </div>

          {/* Testimonials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 md:gap-6 items-stretch">
            {testimonials.map((testimonial, index) => (
              <figure
                key={index}
                className="group relative flex flex-col h-full rounded-2xl p-6 sm:p-7 bg-base-100 border border-base-content/10 shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
              >
                {/* Accent glow on hover */}
                <div
                  className={`pointer-events-none absolute -top-16 -right-16 w-40 h-40 rounded-full bg-gradient-to-br ${avatarGradients[testimonial.accent]} opacity-0 group-hover:opacity-10 blur-2xl transition-opacity duration-500`}
                />

                {/* Decorative quote mark */}
                <div
                  className={`absolute top-4 right-5 text-6xl sm:text-7xl font-serif leading-none bg-gradient-to-br ${avatarGradients[testimonial.accent]} bg-clip-text text-transparent opacity-[0.12] select-none`}
                >
                  &rdquo;
                </div>

                {/* Star rating */}
                <div className="flex items-center gap-0.5 text-amber-400 text-base mb-4 relative z-10">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                </div>

                <blockquote className="flex-1 text-base sm:text-lg text-base-content/80 leading-relaxed font-medium relative z-10">
                  {testimonial.quote}
                </blockquote>

                <figcaption className="flex items-center gap-3 mt-6 pt-5 border-t border-base-content/10 relative z-10">
                  <div
                    className={`flex items-center justify-center w-11 h-11 shrink-0 rounded-full bg-gradient-to-br ${avatarGradients[testimonial.accent]} text-white font-bold text-sm shadow-md`}
                  >
                    {getInitials(testimonial.company)}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-sm text-base-content truncate">
                      {testimonial.company}
                    </div>
                    <div className="text-xs text-base-content/50 leading-snug">
                      {testimonial.role}
                    </div>
                  </div>
                </figcaption>
              </figure>
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
              Used by professionals at{" "}
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
