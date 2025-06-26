"use client";

import Link from "next/link";

const ClassifierHero = () => {
  return (
    <section className="bg-none max-w-7xl mx-auto bg-base-100 flex flex-col lg:flex-row items-center justify-center gap-10 px-8 py-8 lg:py-28">
      <div className="flex flex-col gap-10 items-center justify-center text-center lg:text-left lg:items-start">
        <div className="flex flex-col gap-4 md:gap-8">
          <h1 className="text-white font-extrabold text-4xl md:text-5xl lg:text-6xl tracking-tight md:-mb-4">
            <span>
              The <span className="text-primary">Classification Assistant</span>{" "}
            </span>
            <br className="hidden md:block lg:hidden" />
            <span>for Customs Brokers</span>
            {/* The <span className="text-primary">Intelligent Assistant</span> for
            Customs Brokers */}
          </h1>
          <p className="text-lg text-neutral-300 leading-relaxed">
            HTS Hero helps you classify quickly with confidence & creates a
            delightful experience for your clients.
            {/* Built to make brokers extremely productive, HTS Hero is the smarter
            way to classify. */}
          </p>
        </div>

        <Link
          className="btn btn-wide btn-primary"
          href={"/about/classifier#pricing"}
        >
          Try it now!
        </Link>

        {/* <TestimonialsAvatars priority={true} /> */}
      </div>
      <div className="lg:w-full flex justify-center">
        <video
          className="rounded-2xl w-full sm:w-[34rem]"
          autoPlay
          muted
          loop
          playsInline
          src="/demo.mp4"
        ></video>
      </div>
    </section>
  );
};

export default ClassifierHero;
