import Image from "next/image";
import Link from "next/link";
import { CheckCircleIcon } from "@heroicons/react/16/solid";

export interface FeatureShowcaseData {
  title: string;
  tagline: string;
  description: string;
  features: {
    title: string;
    description: string;
  }[];
  appUrl: string;
  cta: string;
  media: {
    src: string;
    type: "image" | "video";
  };
}

export function FeatureShowcaseSection({
  feature,
  index,
}: {
  feature: FeatureShowcaseData;
  index: number;
}) {
  const isEven = index % 2 === 0;

  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      <div className="max-w-6xl mx-auto px-5 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Content */}
          <div className={isEven ? "lg:order-1" : "lg:order-2"}>
            <span className="inline-block text-xs font-semibold text-secondary uppercase tracking-[0.15em] mb-3">
              {feature.tagline}
            </span>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-base-content mb-4">
              {feature.title}
            </h2>

            <p className="text-base text-base-content/55 leading-relaxed mb-8">
              {feature.description}
            </p>

            {/* Features as compact check list */}
            <ul className="space-y-3 mb-8">
              {feature.features.map((f) => (
                <li key={f.title} className="flex items-start gap-2.5">
                  <CheckCircleIcon className="w-5 h-5 text-success shrink-0 mt-0.5" />
                  <span className="text-sm text-base-content/70 leading-relaxed">
                    <span className="font-semibold text-base-content">
                      {f.title}
                    </span>{" "}
                    &mdash; {f.description}
                  </span>
                </li>
              ))}
            </ul>

            <Link
              href={feature.appUrl}
              className="group inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm bg-secondary text-white hover:opacity-90 transition-all duration-200 shadow-md shadow-secondary/20 hover:shadow-lg hover:shadow-secondary/25"
            >
              {feature.cta}
              <svg
                className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
          </div>

          {/* Media */}
          <div className={isEven ? "lg:order-2" : "lg:order-1"}>
            <div className="relative group">
              {/* Glow behind media */}
              <div className="absolute -inset-2 rounded-2xl bg-gradient-to-br from-secondary/10 via-primary/5 to-secondary/10 blur-xl opacity-70" />

              <div className="relative rounded-2xl overflow-hidden border border-secondary/15 shadow-lg shadow-secondary/[0.06] bg-base-200">
                {feature.media.type === "video" ? (
                  <video
                    src={feature.media.src}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-auto object-cover"
                    aria-label={feature.title}
                  />
                ) : (
                  <Image
                    src={feature.media.src}
                    alt={feature.title}
                    width={800}
                    height={600}
                    className="w-full h-auto object-cover"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
