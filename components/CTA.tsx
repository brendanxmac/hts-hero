import config from "@/config";
import Link from "next/link";

const CTA = () => {
  return (
    <section className="bg-neutral-900 hero overflow-hidden min-h-[75vh]">
      <div className="relative hero-overlay bg-neutral-900"></div>
      <div className="relative hero-content text-center text-neutral-content p-8">
        <div className="flex flex-col items-center max-w-3xl p-8 md:p-0">
          <h2 className="text-white font-bold text-4xl md:text-6xl tracking-tight mb-8 md:mb-12">
            Get your HTS Code now!
          </h2>
          <p className="md:text-lg mb-12 md:mb-16">
            Spare your sanity and your wallet, you deserve it.
          </p>

          <Link
            className="btn btn-primary btn-wide"
            href={config.auth.loginUrl}
          >
            Get {config.appName}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CTA;
