import { SupabaseClient } from "@supabase/supabase-js"
import { randomBytes } from "crypto"

export interface EbookDownload {
  id: string
  email: string
  token: string
  expires_at: string
  requested_at: string
  downloaded: boolean
  downloaded_at: string | null
  ip_address: string | null
  user_agent: string | null
  referrer: string | null
  page_url: string | null
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  utm_term: string | null
  utm_content: string | null
}

export interface CreateEbookDownloadDto {
  email: string
  token: string
  expires_at: string
  ip_address?: string | null
  user_agent?: string | null
  referrer?: string | null
  page_url?: string | null
  utm_source?: string | null
  utm_medium?: string | null
  utm_campaign?: string | null
  utm_term?: string | null
  utm_content?: string | null
}

export interface EbookDownloadUtm {
  utm_source?: string | null
  utm_medium?: string | null
  utm_campaign?: string | null
  utm_term?: string | null
  utm_content?: string | null
}

const TOKEN_BYTES = 32

export function generateEbookDownloadToken(): string {
  return randomBytes(TOKEN_BYTES).toString("hex")
}

export async function createEbookDownload(
  supabase: SupabaseClient,
  dto: CreateEbookDownloadDto
): Promise<EbookDownload> {
  const { data, error } = await supabase
    .from("ebook_downloads")
    .insert({
      email: dto.email,
      token: dto.token,
      expires_at: dto.expires_at,
      ip_address: dto.ip_address ?? null,
      user_agent: dto.user_agent ?? null,
      referrer: dto.referrer ?? null,
      page_url: dto.page_url ?? null,
      utm_source: dto.utm_source ?? null,
      utm_medium: dto.utm_medium ?? null,
      utm_campaign: dto.utm_campaign ?? null,
      utm_term: dto.utm_term ?? null,
      utm_content: dto.utm_content ?? null,
    })
    .select()
    .single<EbookDownload>()

  if (error) {
    console.error("Failed to create ebook_download:", error)
    throw error
  }

  return data
}

export async function getEbookDownloadByToken(
  supabase: SupabaseClient,
  token: string
): Promise<EbookDownload | null> {
  const { data, error } = await supabase
    .from("ebook_downloads")
    .select("*")
    .eq("token", token)
    .maybeSingle<EbookDownload>()

  if (error) {
    console.error("Failed to fetch ebook_download by token:", error)
    throw error
  }

  return data
}

export async function markEbookDownloaded(
  supabase: SupabaseClient,
  id: string
): Promise<void> {
  const { error } = await supabase
    .from("ebook_downloads")
    .update({
      downloaded: true,
      downloaded_at: new Date().toISOString(),
    })
    .eq("id", id)

  if (error) {
    console.error("Failed to mark ebook_download as downloaded:", error)
    throw error
  }
}
