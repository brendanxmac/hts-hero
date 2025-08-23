import Link from "next/link";

const CTA = ({
  title,
  subtitle,
  ctaText,
  ctaLink,
}: {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
}) => {
  return (
    <section className="hero overflow-hidden min-h-[75vh]">
      <div className="relative hero-overlay bg-base-100"></div>
      <div className="relative hero-content text-center text-neutral-content p-8">
        <div className="flex flex-col items-center max-w-4xl p-8 md:p-0 gap-8">
          <h2 className="text-white font-bold text-4xl md:text-6xl tracking-tight">
            {/* Spare your sanity and your wallet */}
            {title}
          </h2>
          <p className="md:text-lg">
            {/* Save yourself from the manual searching, stress, and pricey
            alternatives. <br /> Get a valid HTS Code for your product now! */}
            {subtitle}
          </p>

          <Link className="btn btn-primary btn-wide" href={ctaLink}>
            {ctaText}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CTA;
