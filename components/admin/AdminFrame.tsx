import { ReactNode } from "react"
import { trackerDisplay, trackerSans } from "@/components/ui/font"
import { THEME } from "@/components/ui/theme"
import { isRevisionToolEnabled } from "@/libs/hts-revision-diff/constants"
import AdminSidebar from "./AdminSidebar"

// Every admin tool but the revision checker, in the Tracker's look (DESIGN_SYSTEM.md §15): the
// floating dark sidebar beside the open tool on the soft ground, following light and dark. The
// tools' building blocks (components/hts-revision-diff/ui.tsx) take the look through `tracker:`.
// Buttons keep sentence case here (the site capitalizes .btn globally).
export default function AdminFrame({ children }: { children: ReactNode }) {
  return (
    <div
      className={`${THEME} hts-tracker ${trackerSans.className} ${trackerDisplay.variable} min-h-svh bg-base-200 text-base-content antialiased lg:flex lg:gap-4 lg:p-4 [&_.btn]:normal-case!`}
    >
      <AdminSidebar localTools={isRevisionToolEnabled()} />
      <main className="tt-enter mx-auto flex w-full min-w-0 max-w-[96rem] flex-1 flex-col gap-4 px-4 pb-16 pt-4 sm:px-6 lg:px-0 lg:pt-0">{children}</main>
    </div>
  )
}
