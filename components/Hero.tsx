"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

const Hero = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 1.5;
    }
  }, []);

  return (
    <section className="bg-none max-w-7xl mx-auto bg-base-100 flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-20 px-8 py-8 lg:py-28">
      <div className="flex flex-col gap-6 items-center justify-center text-center lg:text-left lg:items-start">
        <h1 className="text-white font-extrabold text-4xl lg:text-6xl tracking-tight md:-mb-4">
          {/* Find HTS Codes on your own,{" "}
          <span className="text-primary">in Seconds</span> */}
          {/* AI-Powered HTS Code Suggestions in Seconds */}
          AI-Powered HTS Code Discovery
          {/* Find any HTS Codes{" "} */}
          {/* <span className="text-primary">in Seconds</span> */}
        </h1>
        <p className="text-sm sm:text-lg text-neutral-300 leading-relaxed">
          {/* Verify Supplier Codes, Avoid Costly Mistakes, and Ship with Confidence */}
          {/* Verify Supplier Codes, Prevent Costly Mistakes, and Ship with
          Confidence  */}
          Verify supplier codes, avoid costly mistakes, and ship with
          confidence, before consulting your broker.
          {/* Save hours of work, avoid fines or delays at customs, and verify codes
          from suppliers. */}
        </p>

        <Link className="btn btn-primary btn-wide" href={"/app"}>
          Try it now!
        </Link>

        {/* <TestimonialsAvatars priority={true} /> */}
      </div>
      <div className="lg:w-full flex justify-center">
        <video
          ref={videoRef}
          className="rounded-2xl w-full sm:w-[34rem] border border-white/20"
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

export default Hero;
