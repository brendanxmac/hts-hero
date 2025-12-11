"use client";

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
  // ctaText,
  // ctaLink,
  media,
}: Props) => {
  const getHeadline = () => {
    if (standoutPlacement === "start") {
      return (
        <h1 className="font-black text-3xl sm:text-4xl md:text-5xl max-w-5xl">
          <span className="text-primary">{titleStandout}</span> {title}
        </h1>
      );
    } else {
      return (
        <h1 className="font-black text-3xl sm:text-4xl md:text-5xl max-w-5xl">
          {title} <span className="text-primary">{titleStandout}</span>
        </h1>
      );
    }
  };

  return (
    <section className="bg-none mx-auto md:min-h-[70vh] px-4 sm:px-6 md:px-8 lg:px-12 py-12 lg:py-16 flex flex-col items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-4 md:gap-8">
        {/* Hero Text */}
        <div className="flex flex-col gap-4 text-center">
          {getHeadline()}
          <p className="sm:text-lg leading-relaxed">{subtitle}</p>
        </div>

        {/* Hero Video */}
        <div className="w-full flex justify-center sm:rounded-md overflow-hidden -mx-5 md:mx-0">
          {media.mediaType === "video" ? (
            <video
              className="w-full max-h-[75vh] object-contain border-2 border-neutral-content/20 rounded-md md:rounded-2xl"
              autoPlay
              muted
              loop
              playsInline
              src={media.mediaPath}
            ></video>
          ) : (
            <Image
              className=""
              priority={true}
              src={media.mediaPath}
              alt={media.altText}
              width={1000}
              height={600}
            />
          )}
        </div>
      </div>
    </section>
  );
};

export default Demo;
