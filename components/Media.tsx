// A component to display the media (video or image) of the feature. If the type is not specified, it will display an empty div.

import { Feature } from "./FeaturesAccordion";

// Video are set to autoplay for best UX.
export const Media = ({ feature }: { feature: Feature }) => {
  const { mediaType, mediaPath, mediaFormat, altText } = feature;
  console.log("mediaPath:");
  console.log(mediaPath);
  const style = "w-full h-full rounded-2xl object-contain";

  if (mediaType === "video") {
    console.log("video");
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
    console.log("image");
    return (
      <div className="w-full h-full bg-base-200" key={mediaPath}>
        <img src={mediaPath} alt={altText} className={style} key={mediaPath} />
      </div>
    );
  } else {
    console.log("else");
    return <div className={`${style} !border-none`}></div>;
  }
};
