import { Composition, registerRoot } from "remotion"
import { BlackFridayHero } from "./BlackFridayHero"
import { LinkedInAd } from "./LinkedInAd"
import { SimpleAd } from "./SimpleAd"

// Remotion's entry for the Black Friday visual: the email's animated hero a square social post and the LinkedIn ad.
// Rendered by `npm run email:render-black-friday` (scripts/email/render-black-friday.ts)
const FPS = 12
const SECONDS = 4

const Root = () => (
  <>
    <Composition id="black-friday-email" component={BlackFridayHero} defaultProps={{ layout: "banner" as const }} fps={FPS} durationInFrames={FPS * SECONDS} width={600} height={340} />
    <Composition id="black-friday-square" component={BlackFridayHero} defaultProps={{ layout: "square" as const }} fps={30} durationInFrames={30 * SECONDS} width={1080} height={1080} />
    {/* The LinkedIn ad (LinkedInAd.tsx): 6s, pieces arrive then hold */}
    <Composition id="linkedin-portrait" component={LinkedInAd} defaultProps={{ format: "portrait" as const }} fps={30} durationInFrames={180} width={1080} height={1350} />
    <Composition id="linkedin-square" component={LinkedInAd} defaultProps={{ format: "square" as const }} fps={30} durationInFrames={180} width={1080} height={1080} />
    <Composition id="linkedin-landscape" component={LinkedInAd} defaultProps={{ format: "landscape" as const }} fps={30} durationInFrames={180} width={1200} height={627} />
    {/* The simplest post (SimpleAd.tsx): the promo, "40% Off" and the three features' names */}
    <Composition id="simple-portrait" component={SimpleAd} defaultProps={{ format: "portrait" as const }} fps={30} durationInFrames={150} width={1080} height={1350} />
    <Composition id="simple-square" component={SimpleAd} defaultProps={{ format: "square" as const }} fps={30} durationInFrames={150} width={1080} height={1080} />
  </>
)

registerRoot(Root)
