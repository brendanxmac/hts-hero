// Uploads the email wordmark (emails/assets/logo-email.png: the logo on a white rounded chip, so
// it stays readable when an inbox darkens the page) to the public "content" bucket, where
// emails/kit/brand.ts's logoUrl points. Uses the Supabase project in .env.local; run it once per
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

const main = async () => {
  const db = createClient(url, key, { auth: { persistSession: false } })
  const { error } = await db.storage
    .from("content")
    .upload("logo-email.png", readFileSync("emails/assets/logo-email.png"), { contentType: "image/png", upsert: true, cacheControl: "86400" })
  if (error) throw new Error(error.message)
  console.log(`Uploaded ${url}/storage/v1/object/public/content/logo-email.png`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
