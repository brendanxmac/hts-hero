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

const Demo = ({
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
        <h1 className="text-white font-extrabold text-4xl md:text-5xl lg:text-6xl">
          <span className="text-primary">{titleStandout}</span> {title}
        </h1>
      );
    } else {
      return (
        <h1 className="text-white font-extrabold text-4xl md:text-5xl lg:text-6xl">
          {title} <span className="text-primary">{titleStandout}</span>
        </h1>
      );
    }
  };

  return (
    <section className="bg-none max-w-7xl mx-auto bg-base-100 px-4 sm:px-6 md:px-8 lg:px-12 py-8 sm:py-16 md:py-24">
      <div className="flex flex-col items-center justify-center gap-10">
        {/* Hero Text */}
        <div className="flex flex-col gap-4 text-center">
          {getHeadline()}
          <p className="text-lg text-neutral-300 leading-relaxed">{subtitle}</p>

          {/* <div className="flex justify-center">
            <Link className="btn btn-wide btn-primary" href={ctaLink}>
              {ctaText}
            </Link>
          </div> */}

          {/* <TestimonialsAvatars priority={true} /> */}
        </div>

        {/* Hero Video */}
        <div className="w-full flex justify-center sm:rounded-md overflow-hidden -mx-5 md:mx-0">
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

export default Demo;
