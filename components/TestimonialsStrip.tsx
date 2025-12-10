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
    quote:
      "I was really pleased with the AI recommendation – it was very intuitive and caught something I hadn't seen earlier",
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="group relative bg-gradient-to-br from-primary/5 to-base-100 backdrop-blur-sm rounded-lg px-4 py-3 border border-base-content/5 hover:border-primary/20 transition-all duration-300"
            >
              <blockquote className="text-sm text-base-content/80 leading-relaxed mb-2">
                &ldquo;{testimonial.quote}&rdquo;
              </blockquote>
              <div className="flex items-center gap-2">
                <div className="text-[10px] font-semibold text-base-content/50 truncate">
                  {testimonial.role}
                </div>
                <span className="text-base-content/30">·</span>
                <div className="text-[10px] text-primary/60">
                  {testimonial.company}
                </div>
              </div>
            </div>
          ))}
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
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
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
          </div>
        </div>
      )}
    </div>
  );
}

export default TestimonialsStrip;
