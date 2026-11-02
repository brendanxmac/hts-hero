import { loadFont as loadFigtree } from "@remotion/google-fonts/Figtree"
import { loadFont as loadSora } from "@remotion/google-fonts/Sora"
import { loadFont as loadCourier } from "@remotion/google-fonts/CourierPrime"

// Sora for headlines and big numbers, Figtree for the rest (DESIGN_SYSTEM.md §15). Loaded in the
// browser that draws the post; kept apart from brand.ts so server code can read the formats.
export const display = loadSora("normal", { weights: ["600", "700"], subsets: ["latin"] }).fontFamily
export const sans = loadFigtree("normal", { weights: ["400", "500", "600", "700"], subsets: ["latin"] }).fontFamily
// Courier Prime for the launch memo teaser, which reads as a typed document
export const typewriter = loadCourier("normal", { weights: ["400", "700"], subsets: ["latin"] }).fontFamily
