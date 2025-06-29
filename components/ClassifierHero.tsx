"use client";

import Link from "next/link";

const ClassifierHero = () => {
  return (
    <section className="bg-none max-w-7xl mx-auto bg-base-100 flex flex-col items-center justify-center gap-10 p-8">
      <div className="flex flex-col gap-6 items-center justify-center text-center">
        <div className="flex flex-col gap-4 md:gap-8">
          <h1 className="text-white font-extrabold text-4xl md:text-5xl lg:text-6xl tracking-tight md:-mb-4">
            <span>
              The <span className="text-primary">Classification Assistant</span>{" "}
            </span>
            <br className="hidden md:block" />
            <span>for Customs Brokers</span>
            {/* The <span className="text-primary">Intelligent Assistant</span> for
            Customs Brokers */}
          </h1>
          <p className="text-lg text-neutral-300 leading-relaxed">
            Classify quickly with confidence & create a delightful client
            experience.
            {/* Built to make brokers extremely productive, HTS Hero is the smarter
            way to classify. */}
          </p>
        </div>

        <Link className="btn btn-wide btn-primary" href={"/about#pricing"}>
          Try it Free!
        </Link>

        {/* {/* <TestimonialsAvatars priority={true} /> */}
      </div>
      <div className="lg:w-full flex justify-center">
        <video
          className="rounded-2xl w-full border-2 border-neutral-content/20"
          autoPlay
          muted
          loop
          playsInline
          src="/broker-demo.mp4"
        ></video>
      </div>
    </section>
  );
};

export default ClassifierHero;
