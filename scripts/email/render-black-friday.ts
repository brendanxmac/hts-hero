// Renders the Black Friday visual (emails/assets/black-friday, Remotion) to:
//   emails/assets/black-friday.gif      the email's animated hero (600×340 at 1.25x, under ~1 MB)
//   emails/assets/black-friday.png      its first frame, a still for anywhere a GIF won't do
//   social/out/black-friday-square.mp4  a 1080×1080 post for LinkedIn / X
// Then upload the email images with `npm run email:upload-logo` (dev, then production).
// `npm run email:render-black-friday`
import { execFileSync } from "child_process"
import { renameSync, statSync } from "fs"
import sharp from "sharp"
import { resolve } from "path"

const ENTRY = "emails/assets/black-friday/index.tsx"
const run = (args: string[]) => execFileSync("npx", ["remotion", ...args], { stdio: "inherit" })
const kb = (path: string) => `${Math.round(statSync(path).size / 1024)} KB`

const gif = resolve("emails/assets/black-friday.gif")
const png = resolve("emails/assets/black-friday.png")
const mp4 = resolve("social/out/black-friday-square.mp4")

const main = async () => {
  // Remotion's GIF is several MB; a small shared palette and reusing unchanged pixels between
  // frames brings it under ~1 MB, which inboxes load quickly
  const raw = gif.replace(/\.gif$/, ".raw.gif")
  run(["render", ENTRY, "black-friday-email", raw, "--codec=gif", "--scale=1.25", "--number-of-gif-loops=0"])
  await sharp(raw, { animated: true }).gif({ colours: 40, effort: 10, dither: 0, interFrameMaxError: 6, interPaletteMaxError: 3, loop: 0 }).toFile(gif)
  renameSync(raw, `${raw}.tmp`)
  execFileSync("rm", [`${raw}.tmp`])
  run(["still", ENTRY, "black-friday-email", png, "--frame=0", "--scale=2"])
  run(["render", ENTRY, "black-friday-square", mp4, "--codec=h264", "--crf=18"])
  console.log(`\n${gif} (${kb(gif)})\n${png} (${kb(png)})\n${mp4} (${kb(mp4)})`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
