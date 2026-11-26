import { createClient, type SupabaseClient } from "@supabase/supabase-js"

// What keeps an AD/CVD run (the cron) inside Vercel's time limit, whatever is slow that day:
// - a deadline for starting new work (each step checks it; fr.ts and claude.ts stop outside
//   requests at it), and
// - a hard stop some way after it: every database request still open is cancelled, the run's
//   database client refuses new ones, and the route answers straight away.
// Every step picks up where it stopped, so a run cut short only leaves work for the next one.

// A single database request taking this long is stuck: it's cancelled
const REQUEST_MS = 45_000

// A service-role client whose every request is cancelled at `stop` (or after REQUEST_MS). Once
// `stop` fires, nothing more reaches the database from this run, so a step still going can't
// write half its work.
export const runClient = (stop: AbortSignal): SupabaseClient =>
  createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const signals = [stop, AbortSignal.timeout(REQUEST_MS), ...(init?.signal ? [init.signal] : [])]
        return fetch(input, { ...init, cache: "no-store", signal: AbortSignal.any(signals) })
      },
    },
  })

// What a run did so far, step by step, with seconds since it started: logged as it goes, and
// saved when the hard stop cuts it short (so /adcvd and the "cron stopped" email say where)
export const progressLog = (started = Date.now()) => {
  const lines: string[] = []
  const mark = (what: string) => {
    const line = `${Math.round((Date.now() - started) / 1000)}s ${what}`
    lines.push(line)
    console.log(`[adcvd] ${line}`)
  }
  return { lines, mark }
}
export type Progress = ReturnType<typeof progressLog>

// Runs fn until it finishes or `stopAt` (ms from now), whichever is first. At the stop, the
// controller is aborted (cancelling the run's database requests) and this returns null.
export const withHardStop = async <T>(stopAt: number, fn: (stop: AbortSignal) => Promise<T>): Promise<T | null> => {
  const controller = new AbortController()
  let timer: ReturnType<typeof setTimeout> | undefined
  const stopped = new Promise<null>((resolve) => {
    timer = setTimeout(() => {
      controller.abort(new Error("The AD/CVD run reached its hard stop"))
      resolve(null)
    }, stopAt)
  })
  const work = fn(controller.signal)
  // Whatever the work throws after the stop is expected (its requests were cancelled)
  work.catch((): undefined => undefined)
  try {
    return await Promise.race([work, stopped])
  } finally {
    clearTimeout(timer)
  }
}
