"use client";

import Link from "next/link";
import Image from "next/image";

const ClassifierHero = () => {
  return (
    <section className="bg-none max-w-7xl mx-auto bg-base-100 flex flex-col items-center justify-center gap-4 p-8 md:py-12">
      <div className="flex flex-col gap-6 items-center justify-center text-center">
        <div className="flex flex-col gap-4 md:gap-8">
          <h1 className="text-white font-extrabold text-4xl md:text-5xl lg:text-7xl tracking-tight md:-mb-4">
            Classify in{" "}
            <span className="bg-primary px-2 text-base-300 inline-block mt-2">
              Minutes
            </span>
            <br />
            Without Cutting Corners
            {/* Classify Anything in{" "}
            <span className="bg-primary px-2 text-base-300 inline-block mt-2">
              Minutes
            </span>{" "} */}
          </h1>
          <p className="text-lg lg:text-xl text-neutral-300 leading-relaxed">
            Save hours on classification, master tariffs, and delight your
            clients.
          </p>
        </div>
        <Link className="btn btn-wide btn-primary" href="/signin">
          Try it Now!
        </Link>
      </div>
      <div className="flex justify-center sm:rounded-2xl overflow-hidden md:mx-0">
        <Image
          className="rounded-lg"
          priority={true}
          src="/wahla.svg"
          alt="Classifications"
          width={1000}
          height={1000}
        />
        {/* <video
          className="w-full border-2 border-neutral-content/20 rounded-md md:rounded-2xl"
          autoPlay
          muted
          loop
          playsInline
          src="/hero-demo.mp4"
        ></video> */}
      </div>
    </section>
  );
};

export default ClassifierHero;
