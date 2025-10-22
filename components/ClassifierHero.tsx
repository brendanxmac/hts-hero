"use client";

import Link from "next/link";
import TrustedBy from "./TrustedBy";

// Individual testimonials with profile images
const individualTestimonials = [
  {
    role: "Director of Operations & Compliance, LCB",
    company: "Harren Group",
    quote:
      "I was really pleased with the AI recommendation – it was very intuitive and caught something I hadn’t seen earlier",
  },
  {
    role: "VP Forwarding & Customs Brokerage",
    company: "Logisteed America",
    quote:
      "Been loving using htshero. Excellent tool and fun watching you develop this.",
  },
  {
    role: "Director of Customs Operations",
    company: "Nicole",
    quote: "This is saving our team so much time! thank you",
  },
];

// Individual testimonial component
const IndividualTestimonial = ({
  testimonial,
}: {
  testimonial: (typeof individualTestimonials)[0];
}) => (
  <div className="flex flex-col items-center text-center w-full sm:flex-1 sm:max-w-sm lg:max-w-md bg-neutral-800/40 backdrop-blur-sm rounded-xl p-6 border border-neutral-600/30 hover:border-neutral-500/50 transition-all duration-300">
    <blockquote className="text-sm text-neutral-300 mb-3 italic">
      &quot;{testimonial.quote}&quot;
    </blockquote>
    <div className="text-neutral-400 text-xs font-medium">
      {testimonial.role}, {testimonial.company}
    </div>
  </div>
);

const ClassifierHero = () => {
  return (
    <>
      <section className="bg-none max-w-7xl mx-auto bg-base-100 flex flex-col lg:flex-row items-center justify-center gap-10 p-8 md:pt-20 lg:pt-28 md:pb-6">
        <div className="flex flex-col gap-7 lg:gap-10 items-center lg:items-start justify-center text-center lg:text-left lg:flex-1">
          <div className="flex flex-col gap-5 md:gap-8 mt-8">
            <h1 className="text-white font-extrabold text-4xl md:text-5xl lg:text-6xl tracking-tight md:-mb-4">
              Classify Anything in{" "}
              <span className="bg-primary px-2 text-base-300 rounded-sm inline-block mt-2">
                Minutes
              </span>
            </h1>
            <p className="text-sm sm:text-lg text-neutral-300 leading-relaxed">
              Go from product description to HTS Code & client-ready report,
              insanely fast
            </p>
          </div>

          <Link
            className="btn btn-wide btn-sm sm:btn-md btn-primary"
            href="/signin"
          >
            Try it Now!
          </Link>

          {/* <TestimonialsAvatars priority={true} /> */}
        </div>
        <div className="flex justify-center sm:rounded-2xl overflow-hidden -mx-5 md:mx-0 lg:flex-1">
          {/* <Image
            className="rounded-3xl border-2 border-neutral-content/20"
            priority={true}
            src="/classifications.png"
            alt="Classifications"
            width={1000}
            height={1000}
          /> */}
          <video
            className="w-full max-h-96 border border-neutral-content/20 rounded-md md:rounded-2xl"
            autoPlay
            muted
            loop
            playsInline
            src="/new-hero-demo.mp4"
          ></video>
        </div>
      </section>

      {/* Individual Testimonials Section - Full width below other content */}
      <section className="w-full bg-base-100 py-8 md:py-4">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex flex-wrap justify-center items-stretch gap-6 md:gap-8">
            {individualTestimonials.map((testimonial, index) => (
              <IndividualTestimonial key={index} testimonial={testimonial} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default ClassifierHero;
