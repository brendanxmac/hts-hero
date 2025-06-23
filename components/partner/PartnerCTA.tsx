import config from "@/config";
import Link from "next/link";

const PartnerCTA = () => {
  return (
    <section className="hero overflow-hidden min-h-[75vh]">
      <div className="relative hero-overlay bg-base-300"></div>
      <div className="relative hero-content text-center text-neutral-content p-8">
        <div className="flex flex-col items-center max-w-4xl p-8 md:p-0">
          <h2 className="text-white font-bold text-4xl md:text-6xl tracking-tight mb-8 md:mb-12">
            {/* Make Classification a Easy! */}
            {/* Classify with Ease! */}
            Watch your Business grow with{" "}
            <span className="text-primary">automatic</span>
            <br /> classifications
          </h2>
          <p className="md:text-lg mb-12 md:mb-16">
            Provide a desirable offering, free up your resources, and drive more
            upsells.
            <br /> Get the intelligent classification assistant.
          </p>

          <Link
            className="btn btn-primary btn-wide"
            href="/about/partner#pricing"
          >
            Get {config.appName}!
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PartnerCTA;
