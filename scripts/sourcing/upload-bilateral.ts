// Uploads the per-product destination files (build_bilateral.py's out dir) to Supabase Storage,
// where the Sourcing tab reads them: the public bucket "sourcing", at bilateral/<hs6>.json. One
// file per product, cached for a month by the CDN (the Atlas updates once a year). Uses the
// Supabase project in .env.local; run it once per project (dev, then production) after each Atlas
// release: `npm run sourcing:upload-bilateral -- <out dir>`
import { existsSync, readdirSync, readFileSync } from "fs"
import { join } from "path"
import { createClient } from "@supabase/supabase-js"
import { BILATERAL_FOLDER as FOLDER, SOURCING_BUCKET } from "../../libs/sourcing/storage"

const CONCURRENT = 16

if (existsSync(".env.local")) process.loadEnvFile(".env.local")
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
const dir = process.argv[2]
if (!url || !key || !dir) {
  console.error("Usage: npm run sourcing:upload-bilateral -- <out dir> (needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY)")
  process.exit(1)
}

const main = async () => {
  const db = createClient(url, key, { auth: { persistSession: false } })
  // A public bucket: the files are public-domain data, read straight from the CDN
  const { data: buckets } = await db.storage.listBuckets()
  if (!buckets?.some((b) => b.name === SOURCING_BUCKET)) {
    const { error } = await db.storage.createBucket(SOURCING_BUCKET, { public: true })
    if (error) throw new Error(`Creating bucket ${SOURCING_BUCKET}: ${error.message}`)
    console.log(`Created public bucket ${SOURCING_BUCKET}`)
  }
  const files = readdirSync(dir).filter((f) => f.endsWith(".json"))
  let done = 0
  let failed = 0
  for (let i = 0; i < files.length; i += CONCURRENT) {
    await Promise.all(
      files.slice(i, i + CONCURRENT).map(async (f) => {
        const { error } = await db.storage
          .from(SOURCING_BUCKET)
          .upload(`${FOLDER}/${f}`, readFileSync(join(dir, f)), { contentType: "application/json", upsert: true, cacheControl: String(30 * 86_400) })
        if (error) {
          failed++
          console.warn(`${f}: ${error.message}`)
        }
        done++
      })
    )
    if (done % 500 < CONCURRENT) console.log(`${done}/${files.length}`)
  }
  console.log(`Uploaded ${done - failed} of ${files.length} files to ${SOURCING_BUCKET}/${FOLDER}${failed ? ` (${failed} failed)` : ""}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
