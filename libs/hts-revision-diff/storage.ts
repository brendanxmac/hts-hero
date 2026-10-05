// Files in the revision checker's private bucket. Layout:
//   <revision>/attempt-<n>/source/<kind>.<ext>     original uploads
//   <revision>/attempt-<n>/markdown/<kind>.md      datalab output
//   <revision>/attempt-<n>/parsed/notes.json       parsed Chapter 99 notes
//   <revision>/attempt-<n>/parsed/hts-rows.json    parsed Chapter 99 JSON

import type { RevisionDb } from "./access"
import { REVISION_DIFF_BUCKET } from "./constants"
import type { DocumentKind } from "./types"

export const attemptFolder = (revisionName: string, attemptNumber: number) =>
  `${revisionName}/attempt-${attemptNumber}`

export const sourcePath = (folder: string, kind: DocumentKind, filename: string) => {
  const ext = filename.toLowerCase().endsWith(".json") ? "json" : "pdf"
  return `${folder}/source/${kind}.${ext}`
}

export const markdownPath = (folder: string, kind: DocumentKind) => `${folder}/markdown/${kind}.md`

export const uploadFile = async (
  db: RevisionDb,
  path: string,
  body: Blob | Buffer | string,
  contentType: string
) => {
  const { error } = await db.storage
    .from(REVISION_DIFF_BUCKET)
    .upload(path, body, { contentType, upsert: true })
  if (error) throw new Error(`Upload to ${path} failed: ${error.message}`)
}

export const downloadBlob = async (db: RevisionDb, path: string) => {
  const { data, error } = await db.storage.from(REVISION_DIFF_BUCKET).download(path)
  if (error || !data) throw new Error(`Download of ${path} failed: ${error?.message ?? "no data"}`)
  return data
}

export const downloadText = async (db: RevisionDb, path: string) =>
  (await downloadBlob(db, path)).text()

export const downloadJson = async <T>(db: RevisionDb, path: string): Promise<T> =>
  JSON.parse(await downloadText(db, path)) as T

export const signedUrl = async (db: RevisionDb, path: string, seconds = 60 * 10) => {
  const { data, error } = await db.storage
    .from(REVISION_DIFF_BUCKET)
    .createSignedUrl(path, seconds)
  if (error || !data) throw new Error(`Signed URL for ${path} failed: ${error?.message}`)
  return data.signedUrl
}
