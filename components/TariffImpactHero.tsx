"use client";

import Link from "next/link";

const TariffImpactHero = () => {
  return (
    <section className="bg-none max-w-7xl mx-auto bg-base-100 px-4 sm:px-6 md:px-8 lg:px-12 py-8 sm:py-16 md:py-24">
      <div className="flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-16">
        {/* Hero Text */}
        <div className="flex flex-col gap-4 md:gap-8 text-center lg:text-left lg:flex-1">
          <h1 className="text-white font-extrabold text-4xl md:text-5xl lg:text-6xl tracking-tight md:-mb-4">
            <span className="bg-primary px-2 text-base-300 transform -rotate-1 inline-block">
              Instantly
            </span>{" "}
            See If Tariff Updates Effect your Imports{" "}
          </h1>
          <p className="text-lg text-neutral-300 leading-relaxed">
            Save your bottom line and your sanity with copy & paste
            {/* Without the delay, headaches, and error-prone manual labor */}
          </p>

          <div className="flex justify-center lg:justify-start">
            <Link
              className="btn btn-wide btn-primary"
              href="/tariffs/impact-checker"
            >
              Try it Now!
            </Link>
          </div>

          {/* <TestimonialsAvatars priority={true} /> */}
        </div>

        {/* Hero Video */}
        <div className="flex justify-center sm:rounded-md overflow-hidden -mx-5 md:mx-0 lg:flex-1">
          {/* <Image
            className="rounded-lg border-2 border-neutral-content/20"
            priority={true}
            src="/tariff-impacts-hero.png"
            alt="Tariff Impacts"
            width={1000}
            height={1000}
          /> */}
          <video
            className="w-full border-2 border-neutral-content/20 rounded-md md:rounded-2xl"
            autoPlay
            muted
            loop
            playsInline
            src="/tariff-impact-demo.mp4"
          ></video>
        </div>
      </div>
    </section>
  );
};

export default TariffImpactHero;
