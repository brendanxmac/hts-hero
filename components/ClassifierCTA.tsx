import config from "@/config";
import Link from "next/link";

const ClassifierCTA = () => {
  return (
    <section className="hero overflow-hidden min-h-[75vh]">
      <div className="relative hero-overlay bg-black"></div>
      <div className="relative hero-content text-center text-neutral-content p-8">
        <div className="flex flex-col items-center max-w-4xl p-8 md:p-0">
          <h2 className="text-white font-bold text-4xl md:text-6xl tracking-tight mb-8 md:mb-12">
            {/* Make Classification a Easy! */}
            {/* Classify with Ease! */}
            Experience the <span className="text-primary">smarter</span>
            <br /> way to classify
          </h2>
          <p className="md:text-lg mb-12 md:mb-16">
            Save yourself from manual searching, report creation, and analysis.
            <br /> Get the intelligent assistant for classifiers.
          </p>

          <Link
            className="btn btn-primary btn-wide"
            href="/about/classifier#pricing"
          >
            Get {config.appName}!
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ClassifierCTA;
