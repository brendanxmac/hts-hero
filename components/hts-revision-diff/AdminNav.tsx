"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const TOOLS = [
  { href: "/revision-checker", label: "Revision checker" },
  { href: "/coverage-checker", label: "Coverage checker" },
]

// Switches between the admin tools that share AdminShell
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
