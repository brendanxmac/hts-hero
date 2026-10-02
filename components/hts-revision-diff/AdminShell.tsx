import Link from "next/link"
import { ReactNode } from "react"

// Admin shell for the revision checker: slim top bar over a neutral canvas.
// Buttons keep sentence case here (the site capitalizes .btn globally).
export default function AdminShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-base-200/50 text-base-content antialiased [&_.btn]:!normal-case">
      <header className="sticky top-0 z-40 border-b border-base-content/10 bg-base-100/85 backdrop-blur">
        <div className="mx-auto flex h-12 max-w-7xl items-center gap-3 px-4 sm:px-6">
          <Link href="/revision-checker" className="flex items-center gap-2.5 text-sm font-semibold tracking-tight">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-base-content text-[11px] font-bold text-base-100">
              RC
            </span>
            Revision checker
          </Link>
          <span className="rounded border border-base-content/15 px-1.5 py-px text-[10px] font-medium uppercase tracking-wider text-base-content/50">
            Admin
          </span>
          <Link href="/" className="ml-auto text-xs text-base-content/50 hover:text-base-content">
            HTS Hero ↗
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6">{children}</main>
    </div>
  )
}
