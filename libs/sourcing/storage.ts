// Where the Sourcing tab's per-product destination files live: Supabase Storage's public bucket
// "sourcing", at bilateral/<hs6>.json (scripts/sourcing/upload-bilateral.ts puts them there)
export const SOURCING_BUCKET = "sourcing"
export const BILATERAL_FOLDER = "bilateral"

export const bilateralUrl = (hs6: string) =>
  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${SOURCING_BUCKET}/${BILATERAL_FOLDER}/${hs6}.json`
