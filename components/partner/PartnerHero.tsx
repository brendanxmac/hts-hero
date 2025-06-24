"use client";

import Link from "next/link";
// import { RegistrationTrigger } from "../libs/early-registration";

interface AboutHeroProps {
  // setIsRegisterOpen: (isOpen: boolean) => void;
  // setRegistrationTrigger: (trigger: RegistrationTrigger) => void;
}

const ClassifierHero = () => {
  return (
    <section className="bg-none max-w-7xl mx-auto bg-base-100 flex flex-col lg:flex-row items-center justify-center gap-10 px-8 py-8 lg:py-28">
      <div className="flex flex-col gap-10 items-center justify-center text-center lg:text-left lg:items-start">
        <h1 className="text-white font-extrabold text-4xl md:text-5xl lg:text-6xl tracking-tight md:-mb-4">
          {/* HTS Codes for your Clients
          <br />
          <span className="text-primary">without Lifting a Finger</span> */}
          Automatic HTS Codes that Boost your Business
        </h1>
        <p className="text-lg text-neutral-300 leading-relaxed">
          {/* Self-Service HTS Codes for your clients with help and upsells
          opportunities just a click away. */}
          The self-service classification system that gets more clients & leads
          to upsells.
        </p>

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
