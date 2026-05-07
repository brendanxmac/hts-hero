import { SupabaseClient } from "@supabase/supabase-js"

export interface Webinar {
  id: string
  slug: string
  title: string
  description: string
  graphic_url: string | null
  scheduled_at: string
  duration_minutes: number
  presenter_name: string
  presenter_title: string | null
  presenter_avatar_url: string | null
  join_link: string | null
  promo_video_url: string | null
  status: "upcoming" | "live" | "completed" | "cancelled"
  max_registrants: number | null
  created_at: string
  updated_at: string
}

export interface WebinarRegistration {
  id: string
  webinar_id: string
  email: string
  user_id: string | null
  registered_at: string
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

export interface CreateWebinarRegistrationDto {
  webinar_id: string
  email: string
  user_id?: string | null
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

export async function getAllWebinars(
  supabase: SupabaseClient
): Promise<Webinar[]> {
  const { data, error } = await supabase
    .from("webinars")
    .select("*")
    .order("scheduled_at", { ascending: false })

  if (error) {
    console.error("Failed to fetch webinars:", error)
    throw error
  }

  return (data ?? []) as Webinar[]
}

export async function getWebinarBySlug(
  supabase: SupabaseClient,
  slug: string
): Promise<Webinar | null> {
  const { data, error } = await supabase
    .from("webinars")
    .select("*")
    .eq("slug", slug)
    .maybeSingle<Webinar>()

  if (error) {
    console.error("Failed to fetch webinar by slug:", error)
    throw error
  }

  return data
}

export async function createWebinarRegistration(
  supabase: SupabaseClient,
  dto: CreateWebinarRegistrationDto
): Promise<WebinarRegistration> {
  const { data, error } = await supabase
    .from("webinar_registrations")
    .insert({
      webinar_id: dto.webinar_id,
      email: dto.email,
      user_id: dto.user_id ?? null,
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
    .single<WebinarRegistration>()

  if (error) {
    console.error("Failed to create webinar registration:", error)
    throw error
  }

  return data
}

export async function getWebinarRegistrationCount(
  supabase: SupabaseClient,
  webinarId: string
): Promise<number> {
  const { count, error } = await supabase
    .from("webinar_registrations")
    .select("*", { count: "exact", head: true })
    .eq("webinar_id", webinarId)

  if (error) {
    console.error("Failed to count webinar registrations:", error)
    return 0
  }

  return count ?? 0
}

export async function getRegistrationByEmailAndWebinar(
  supabase: SupabaseClient,
  email: string,
  webinarId: string
): Promise<WebinarRegistration | null> {
  const { data, error } = await supabase
    .from("webinar_registrations")
    .select("*")
    .eq("webinar_id", webinarId)
    .eq("email", email)
    .maybeSingle<WebinarRegistration>()

  if (error) {
    console.error("Failed to check existing registration:", error)
    throw error
  }

  return data
}
