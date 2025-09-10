"use client";

import Link from "next/link";
import Image from "next/image";
import { FeatureI } from "../interfaces/ui";

interface Props {
  title: string;
  titleStandout: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  media: FeatureI;
  standoutPlacement: TextPlacement;
}

type TextPlacement = "start" | "end";

const Hero = ({
  title,
  titleStandout,
  standoutPlacement,
  subtitle,
  ctaText,
  ctaLink,
  media,
}: Props) => {
  const getHeadline = () => {
    if (standoutPlacement === "start") {
      return (
        <h1 className="text-white font-extrabold text-4xl md:text-5xl lg:text-7xl tracking-tight md:-mb-4">
          <span className="bg-primary px-2 text-base-300 transform -rotate-1 inline-block">
            {titleStandout}
          </span>{" "}
          {title}
        </h1>
      );
    } else {
      return (
        <h1 className="text-white font-extrabold text-4xl md:text-5xl lg:text-7xl tracking-tight md:-mb-4">
          {title}{" "}
          <span className="bg-primary px-2 text-base-300 transform -rotate-1 inline-block">
            {titleStandout}
          </span>
        </h1>
      );
    }
  };

  return (
    <section className="bg-none max-w-7xl mx-auto bg-base-100 px-4 sm:px-6 md:px-8 lg:px-12 py-8 sm:py-16 md:py-24">
      <div className="flex flex-col items-center justify-center gap-10">
        {/* Hero Text */}
        <div className="flex flex-col gap-4 md:gap-8 text-center">
          {getHeadline()}
          <p className="text-lg text-neutral-300 leading-relaxed">{subtitle}</p>

          <div className="flex justify-center">
            <Link className="btn btn-wide btn-primary" href={ctaLink}>
              {ctaText}
            </Link>
          </div>

          {/* <TestimonialsAvatars priority={true} /> */}
        </div>

        {/* Hero Video */}
        <div className="flex justify-center sm:rounded-md overflow-hidden max-w-6xl w-full">
          {media.mediaType === "video" ? (
            <video
              className="w-full border-2 border-neutral-content/20 rounded-md md:rounded-2xl"
              autoPlay
              muted
              loop
              playsInline
              src={media.mediaPath}
            ></video>
          ) : (
            <Image
              className="rounded-lg border-2 border-neutral-content/20"
              priority={true}
              src={media.mediaPath}
              alt={media.altText}
              width={1000}
              height={1000}
            />
          )}
        </div>
      </div>
    </section>
  );
};

export default Hero;
