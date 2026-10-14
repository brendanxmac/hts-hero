import { Composition, registerRoot } from "remotion"
import { Format, FORMATS, FPS } from "../brand"
import { COMPONENTS } from "../components"
import { compositionId, TEMPLATE_IDS, TEMPLATES } from "../registry"
import { SAMPLES } from "../samples"

// Remotion's entry point: every template in every format, for Remotion Studio
// (`npm run social:studio`) and the Remotion CLI. The studio page renders posts in the browser
// (components/social-studio/renderInBrowser.ts).

const Root = () => (
  <>
    {TEMPLATE_IDS.flatMap((id) =>
      (Object.keys(FORMATS) as Format[]).map((format) => (
        <Composition
          key={compositionId(id, format)}
          id={compositionId(id, format)}
          component={COMPONENTS[id]}
          durationInFrames={TEMPLATES[id].seconds * FPS}
          fps={FPS}
          width={FORMATS[format].width}
          height={FORMATS[format].height}
          defaultProps={SAMPLES[id]}
        />
      ))
    )}
  </>
)

registerRoot(Root)
