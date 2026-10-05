import { NextResponse } from "next/server"

export const errorResponse = (error: unknown, status = 500) =>
  NextResponse.json({ error: (error as Error)?.message ?? String(error) }, { status })
