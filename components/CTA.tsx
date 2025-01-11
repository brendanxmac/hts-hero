import config from "@/config";

const CTA = () => {
  return (
    <section className="bg-black hero overflow-hidden min-h-screen">
      <div className="relative hero-overlay bg-black"></div>
      <div className="relative hero-content text-center text-neutral-content p-8">
        <div className="flex flex-col items-center max-w-3xl p-8 md:p-0">
          <h2 className="font-bold text-4xl md:text-6xl tracking-tight mb-8 md:mb-12">
            Nearly Instant, Almost Free
          </h2>
          <p className="md:text-lg opacity-80 mb-12 md:mb-16">
            Free yourself from reading through PDF's and hoping you didn't miss
            something or hiring someone for more who takes 10x longer
          </p>

          <button className="btn btn-primary btn-wide">
            Get {config.appName}
          </button>
        </div>
      </div>
    </section>
  );
};

export default CTA;
