"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const TOOLS = [
  { href: "/admin", label: "Needs You" },
  { href: "/revision-checker", label: "Revision Checker" },
  { href: "/coverage-checker", label: "Coverage Checker" },
  { href: "/tariff-sources", label: "Tariff Updates" },
  { href: "/adcvd", label: "AD/CVD" },
  { href: "/email-outbox", label: "Outbox" },
  { href: "/content-studio", label: "Content Studio" },
]

// The revision checker's links to the other admin tools (they're in components/admin/AdminFrame)
export default function AdminNav() {
  const pathname = usePathname() ?? ""
  return (
    <nav className="flex items-center gap-1">
      {TOOLS.map((tool) => {
        const active = pathname.startsWith(tool.href)
        return (
          <Link
            key={tool.href}
            href={tool.href}
            className={`rounded-md px-2 py-1 text-sm font-medium transition-colors ${
              active ? "bg-base-content/[0.07] text-base-content" : "text-base-content/50 hover:text-base-content"
            }`}
          >
            {tool.label}
          </Link>
        )
      })}
    </nav>
  )
}
