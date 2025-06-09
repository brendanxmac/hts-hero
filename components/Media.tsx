// A component to display the media (video or image) of the feature. If the type is not specified, it will display an empty div.

import { Feature } from "./FeaturesAccordion";

// Video are set to autoplay for best UX.
export const Media = ({ feature }: { feature: Feature }) => {
  const { mediaType, mediaPath, mediaFormat, altText } = feature;
  const style = "w-full h-full rounded-2xl object-contain";

  if (mediaType === "video") {
    return (
      <div className="w-full h-full">
        <video className={style} autoPlay muted loop playsInline>
          <source src={mediaPath} type={mediaFormat} />
        </video>
      </div>
    );
  } else if (mediaType === "image") {
    return (
      <div className="w-full h-full bg-base-200">
        <img src={mediaPath} alt={altText} className={style} />
      </div>
    );
  } else {
    return <div className={`${style} !border-none`}></div>;
  }
};
