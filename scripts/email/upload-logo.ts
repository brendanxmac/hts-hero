// Uploads the email images to the public "content" bucket, where emails/kit/brand.ts points: the
// wordmark (emails/assets/logo-email-card.png: the logo on a white rounded chip, so it stays
// readable when an inbox darkens the page) and the Duty Guard launch hero (duty-guard-hero.png,
// from `npm run email:render-hero`). Uses the Supabase project in .env.local; run it once per
// project (dev, then production): `npm run email:upload-logo`
import { existsSync, readFileSync } from "fs"
import { createClient } from "@supabase/supabase-js"

if (existsSync(".env.local")) process.loadEnvFile(".env.local")
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) {
  console.error("Needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY")
  process.exit(1)
}

// logo-email.png is the old one on the grey page: emails already sent still load it, so it stays
const LOGOS = ["logo-email-card.png", "logo-email.png", "duty-guard-hero.png"]

const main = async () => {
  const db = createClient(url, key, { auth: { persistSession: false } })
  for (const file of LOGOS) {
    const { error } = await db.storage.from("content").upload(file, readFileSync(`emails/assets/${file}`), { contentType: "image/png", upsert: true, cacheControl: "86400" })
    if (error) throw new Error(error.message)
    console.log(`Uploaded ${url}/storage/v1/object/public/content/${file}`)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
