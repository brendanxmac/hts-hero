import config from "@/config";
import Link from "next/link";

const AboutHero = () => {
  return (
    <section className="bg-none max-w-7xl mx-auto bg-base-100 flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-20 px-8 py-8 lg:py-20">
      <div className="flex flex-col gap-10 items-center justify-center text-center lg:text-left lg:items-start">
        <h1 className="font-extrabold text-4xl lg:text-6xl tracking-tight md:-mb-4">
          {/* The HTS Helper You Always Wanted{<br />} */}
          {/* Helpful Tools that Make Classifying a Breeze{<br />} */}
          {/* The HTS Helper that Makes Classifying a Breeze{<br />} */}
          {/* The HTS Helper that Makes Classifying a Joy{<br />} */}
          {/* === */}
          Easily Classify Products in <s className="text-neutral-800">
            Hours
          </s>{" "}
          <span className="text-[#40C969]">Minutes</span>
          {/* === */}
          {/* The <span className="text-[#40C969]">Intelligent</span> HTS Assistant */}
        </h1>
        <p className="text-lg text-neutral-400 leading-relaxed">
          Transform classifications from time-consuming and tedious to
          effortless and enjoyable.
          <br /> You'll wonder how you ever did classifications without it.
        </p>

        {/* <p className="text-lg text-neutral-400 leading-relaxed">
          Built to make you unreasonably productive, HTS Hero is the best way to
          do classifications with the help of AI.
        </p>
        <p className="text-lg text-neutral-400 leading-relaxed">
          Built to make you unreasonably productive, HTS Hero will have you
          wondering how you ever did classifications without it.
        </p> */}
        <Link
          className="btn btn-primary bg-white text-black hover:text-white btn-wide rounded-md"
          href={config.auth.callbackUrl}
        >
          Try it free!
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
          src="/hero-demo.mp4"
        ></video>
      </div>
    </section>
  );
};

export default AboutHero;
