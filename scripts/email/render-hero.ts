// Renders emails/assets/duty-guard-hero.html (the Duty Guard launch email's hero image) to
// emails/assets/duty-guard-hero.png: headless Chrome at 2x for sharp text on retina screens, then
// a palette PNG so inboxes load ~100 KB, not ~330 KB. Upload it with `npm run email:upload-logo`.
// `npm run email:render-hero` (macOS; set CHROME to use another Chrome binary)
import { execFileSync } from "child_process"
import { mkdtempSync, rmSync } from "fs"
import { tmpdir } from "os"
import { join, resolve } from "path"
import sharp from "sharp"

const CHROME = process.env.CHROME ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
const SRC = resolve("emails/assets/duty-guard-hero.html")
const OUT = resolve("emails/assets/duty-guard-hero.png")
// The image's size in CSS pixels, matching html/body in the source
const [W, H] = [560, 392]

const main = async () => {
  const dir = mkdtempSync(join(tmpdir(), "email-hero-"))
  const raw = join(dir, "raw.png")
  try {
    execFileSync(CHROME, [
      "--headless=new",
      "--disable-gpu",
      "--hide-scrollbars",
      // Keeps the rounded corners transparent
      "--default-background-color=00000000",
      "--force-device-scale-factor=2",
      `--window-size=${W},${H}`,
      // Time for the Google fonts to load
      "--virtual-time-budget=5000",
      `--screenshot=${raw}`,
      `file://${SRC}`,
    ], { stdio: "ignore" })
    const { size } = await sharp(raw).png({ palette: true, quality: 95, effort: 10, dither: 1 }).toFile(OUT)
    console.log(`Wrote ${OUT} (${Math.round(size / 1024)} KB)`)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
