import Image from "next/image";
import Link from "next/link";

// Extended product data for full-page sections
export interface ProductSectionData {
  emoji: string;
  title: string;
  tagline: string;
  description: string;
  features: {
    icon: string;
    title: string;
    description: string;
  }[];
  aboutUrl: string;
  appUrl: string;
  cta: string;
  accentColor: "primary" | "secondary" | "accent";
  media: {
    src: string;
    type: "image" | "video";
  };
}

// Full-page Product Section Component
export function ProductSection({
  product,
  index,
}: {
  product: ProductSectionData;
  index: number;
}) {
  const isEven = index % 2 === 0;

  // Simplified color scheme - use primary for all, keep it clean
  const accentColorClasses = {
    primary: {
      bg: "bg-primary",
      text: "text-primary",
      border: "border-primary/20",
      hoverBorder: "hover:border-primary/30",
    },
    secondary: {
      bg: "bg-secondary",
      text: "text-secondary",
      border: "border-secondary/20",
      hoverBorder: "hover:border-secondary/30",
    },
    accent: {
      bg: "bg-accent",
      text: "text-accent",
      border: "border-accent/20",
      hoverBorder: "hover:border-accent/30",
    },
  };

  const colors = accentColorClasses[product.accentColor];

  return (
    <section
      className={`relative py-16 md:py-24 ${
        isEven ? "bg-base-100" : "bg-base-200/50"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6">
        <div
          className={`grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center`}
        >
          {/* Content Side */}
          <div className={`${isEven ? "lg:order-1" : "lg:order-2"}`}>
            {/* Section label */}
            <div className="flex items-center gap-2 mb-4">
              <span className={`inline-block w-8 h-px ${colors.bg}`} />
              <span
                className={`text-xs font-semibold ${colors.text} uppercase tracking-widest`}
              >
                {product.tagline}
              </span>
            </div>

            {/* Title */}
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-base-content mb-4">
              {product.title}
            </h2>

            {/* Description */}
            <p className="text-base text-base-content/60 leading-relaxed mb-6">
              {product.description}
            </p>

            {/* Features List - cleaner vertical list */}
            <ul className="space-y-3 mb-8">
              {product.features.map((feature) => (
                <li key={feature.title} className="flex items-start gap-3">
                  <svg
                    className={`w-5 h-5 ${colors.text} flex-shrink-0 mt-0.5`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <div>
                    <span className="font-medium text-base-content">
                      {feature.title}
                    </span>
                    <span className="text-base-content/50"> — </span>
                    <span className="text-base-content/60">
                      {feature.description}
                    </span>
                  </div>
                </li>
              ))}
            </ul>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={product.appUrl}
                className={`group inline-flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-sm ${colors.bg} text-white hover:opacity-90 transition-all duration-200 shadow-sm hover:shadow-md`}
              >
                <span>{product.cta}</span>
                <svg
                  className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5"
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
              <Link
                href={product.aboutUrl}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm ${colors.text} hover:bg-base-200 transition-colors duration-200`}
              >
                Learn More
              </Link>
            </div>
          </div>

          {/* Media/Visual Side */}
          <div className={`${isEven ? "lg:order-2" : "lg:order-1"}`}>
            <div
              className={`relative rounded-xl overflow-hidden border ${colors.border} shadow-lg bg-base-200`}
            >
              {product.media.type === "video" ? (
                <video
                  src={product.media.src}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-auto object-cover"
                  aria-label={product.title}
                />
              ) : (
                <Image
                  src={product.media.src}
                  alt={product.title}
                  width={800}
                  height={600}
                  className="w-full h-auto object-cover"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
