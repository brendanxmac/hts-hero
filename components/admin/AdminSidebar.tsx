"use client"

import { ComponentType, SVGProps, useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ArrowTopRightOnSquareIcon,
  BellAlertIcon,
  CodeBracketSquareIcon,
  EnvelopeIcon,
  InboxStackIcon,
  NewspaperIcon,
  ScaleIcon,
  SparklesIcon,
  Squares2X2Icon,
} from "@heroicons/react/20/solid"
import logo from "@/app/logo.svg"
import * as tt from "@/components/ui/styles/tracker"
import { ThemeSwitch } from "@/components/tariff-tracker/shell/ThemeSwitch"
import type { AdminArea, AdminQueue } from "@/libs/admin/queue"

// The admin tools' sidebar, the Tracker's (DESIGN_SYSTEM.md §15 "Sidebar"): floating, dark in
// both modes, Needs You first, then each tool with a small pill for what waits there (amber, from
// libs/admin/queue.ts). The local-only checkers sit apart, under Local. On narrow screens it becomes
// a row of pills across the top.

type Icon = ComponentType<SVGProps<SVGSVGElement>>

interface Tool {
  href: string
  label: string
  Icon: Icon
  area?: AdminArea | "all"
  local?: boolean
  // Opens the old-style page (the revision checker keeps its own shell)
  external?: boolean
}

const TOOLS: Tool[] = [
  { href: "/admin", label: "Needs You", Icon: BellAlertIcon, area: "all" },
  { href: "/tariff-sources", label: "Tariff Updates", Icon: NewspaperIcon, area: "updates" },
  { href: "/email-outbox", label: "Outbox", Icon: EnvelopeIcon, area: "outbox" },
  { href: "/adcvd", label: "AD/CVD Cases", Icon: ScaleIcon, area: "adcvd" },
  { href: "/content-studio", label: "Content Studio", Icon: SparklesIcon, area: "studio" },
  { href: "/coverage-checker", label: "Coverage Checker", Icon: Squares2X2Icon, local: true },
  { href: "/revision-checker", label: "Revision Checker", Icon: CodeBracketSquareIcon, local: true, external: true },
]

// The queue's counts, again on every page change (an approval elsewhere clears its count)
const useQueueCounts = () => {
  const pathname = usePathname()
  const [counts, setCounts] = useState<Record<AdminArea, number> | null>(null)
  useEffect(() => {
    let cancelled = false
    fetch("/api/admin/queue", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((q: AdminQueue | null) => !cancelled && q && setCounts(q.counts))
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [pathname])
  return counts
}

const countFor = (tool: Tool, counts: Record<AdminArea, number> | null) => {
  if (!counts || !tool.area) return 0
  return tool.area === "all" ? Object.values(counts).reduce((a, b) => a + b, 0) : counts[tool.area]
}

const NavItem = ({ tool, active, count }: { tool: Tool; active: boolean; count: number }) => (
  <Link
    href={tool.href}
    aria-current={active ? "page" : undefined}
    className={`flex h-10 items-center gap-3 rounded-xl px-3 text-sm transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/40 ${
      active ? "bg-tt-side-active font-semibold text-base-content" : "font-medium text-base-content/70 hover:bg-tt-side-active hover:text-base-content"
    }`}
  >
    <tool.Icon className={`h-[18px] w-[18px] shrink-0 ${active ? "text-base-content" : "text-base-content/60"}`} aria-hidden />
    <span className="flex-1 truncate">{tool.label}</span>
    {count > 0 && <span className="rounded-full bg-warning/15 px-2 py-0.5 text-[0.7rem] font-semibold tabular-nums text-warning">{count}</span>}
    {tool.external && <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5 text-base-content/40" aria-label="Opens in its own layout" />}
  </Link>
)

export default function AdminSidebar({ localTools }: { localTools: boolean }) {
  const pathname = usePathname() ?? ""
  const counts = useQueueCounts()
  const tools = TOOLS.filter((t) => localTools || !t.local)
  const isActive = (t: Tool) => pathname === t.href || pathname.startsWith(`${t.href}/`)
  return (
    <>
      <aside className="hts-tracker-on-dark sticky top-4 hidden h-[calc(100svh-2rem)] w-60 shrink-0 flex-col gap-5 rounded-lg bg-tt-side p-4 text-base-content lg:flex">
        <div className="flex items-center gap-2.5 px-2 pt-1">
          <Link href="/" className="flex shrink-0 items-center rounded-full bg-base-content p-1" aria-label="HTS Hero home">
            <Image src={logo} alt="" className="w-6" width={24} height={24} />
          </Link>
          <div className="flex min-w-0 flex-col">
            <span className={`${tt.display} truncate text-[0.95rem] font-semibold`}>Admin</span>
            <span className="truncate text-xs text-base-content/60">HTS Hero</span>
          </div>
        </div>
        <nav aria-label="Admin tools" className="flex flex-1 flex-col gap-4 overflow-y-auto">
          <div className="flex flex-col gap-1">
            {tools.filter((t) => !t.local).map((t) => (
              <NavItem key={t.href} tool={t} active={isActive(t)} count={countFor(t, counts)} />
            ))}
          </div>
          {localTools && (
            <div className="flex flex-col gap-1">
              <span className="px-3 pb-1 text-[0.7rem] font-bold uppercase tracking-wider text-base-content/60">Local</span>
              {tools.filter((t) => t.local).map((t) => (
                <NavItem key={t.href} tool={t} active={isActive(t)} count={0} />
              ))}
            </div>
          )}
          <div className="mt-auto flex flex-col gap-1">
            <NavItem tool={{ href: "/tariff-tracker", label: "Tariff Tracker", Icon: InboxStackIcon }} active={false} count={0} />
          </div>
        </nav>
        <div className="flex items-center justify-between gap-2 px-1">
          <Link href="/" className="flex items-center gap-1.5 px-2 text-xs font-medium text-base-content/60 hover:text-base-content">
            htshero.com
            <ArrowTopRightOnSquareIcon className="h-3 w-3" aria-hidden />
          </Link>
          <ThemeSwitch />
        </div>
      </aside>

      {/* Phones and tablets */}
      <nav aria-label="Admin tools" className="flex shrink-0 gap-1 overflow-x-auto border-b border-base-300 bg-base-100 px-2 py-2 lg:hidden">
        {tools.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium ${isActive(t) ? "bg-base-content text-base-100" : "text-base-content/70 hover:bg-tt-soft"}`}
          >
            {t.label}
            {countFor(t, counts) > 0 && <span className="ml-1.5 text-warning">{countFor(t, counts)}</span>}
          </Link>
        ))}
      </nav>
    </>
  )
}
