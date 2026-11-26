import { Composition, registerRoot } from "remotion"
import { BlackFridayHero } from "./BlackFridayHero"

// Remotion's entry for the Black Friday visual: the email's animated hero and a square social post.
// Rendered by `npm run email:render-black-friday` (scripts/email/render-black-friday.ts)
const FPS = 12
const SECONDS = 4

const Root = () => (
  <>
    <Composition id="black-friday-email" component={BlackFridayHero} defaultProps={{ layout: "banner" as const }} fps={FPS} durationInFrames={FPS * SECONDS} width={600} height={340} />
    <Composition id="black-friday-square" component={BlackFridayHero} defaultProps={{ layout: "square" as const }} fps={30} durationInFrames={30 * SECONDS} width={1080} height={1080} />
  </>
)

registerRoot(Root)
