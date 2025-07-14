import config from "@/config";
import Link from "next/link";

const ClassifierCTA = () => {
  return (
    <section className="hero overflow-hidden min-h-[75vh]">
      <div className="relative hero-overlay bg-base-300"></div>
      <div className="relative hero-content text-center text-neutral-content p-8">
        <div className="flex flex-col items-center max-w-4xl">
          <h2 className="text-white font-bold text-4xl md:text-6xl tracking-tight mb-8 md:mb-12">
            Experience the <span className="text-primary">smarter</span>
            <br /> way to classify
          </h2>
          <p className="md:text-lg mb-12 md:mb-16">
            Save hours on classification & delight your clients.
            <br />
            Get the classification assistant built for customs brokers.
          </p>

          <Link className="btn btn-primary btn-wide" href="/signin">
            Try {config.appName}!
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ClassifierCTA;
