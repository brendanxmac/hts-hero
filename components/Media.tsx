// A component to display the media (video or image) of the feature. If the type is not specified, it will display an empty div.

import Image from "next/image";
import { Feature } from "./FeaturesAccordion";

// Video are set to autoplay for best UX.
export const Media = ({ feature }: { feature: Feature }) => {
  if (!feature) {
    return null;
  }

  const { mediaType, mediaPath, mediaFormat, altText } = feature;
  const style =
    "w-full h-full rounded-2xl object-contain border border-white/30 lg:shadow-xl lg:shadow-white/30";

  if (mediaType === "video") {
    return (
      <div className="w-full h-full" key={mediaPath}>
        <video
          className={style}
          autoPlay
          muted
          loop
          playsInline
          key={mediaPath}
        >
          <source src={mediaPath} type={mediaFormat} />
        </video>
      </div>
    );
  } else if (mediaType === "image") {
    return (
      <div className="w-full h-full bg-base-200" key={mediaPath}>
        <Image
          src={mediaPath}
          alt={altText}
          className={style}
          key={mediaPath}
          width={1000}
          height={1000}
        />
      </div>
    );
  } else {
    return <div className={`${style} !border-none`}></div>;
  }
};
