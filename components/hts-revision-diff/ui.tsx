"use client"

import Link from "next/link"
import { ReactNode, useEffect, useRef } from "react"

// Building blocks for the revision checker's admin UI. Color is reserved for
// meaning: green = added/approved/done, red = removed/failed, amber = needs
// attention, blue = in progress. Everything else is neutral.

export type Tone = "neutral" | "info" | "success" | "warning" | "error"

const DOT: Record<Tone, string> = {
  neutral: "bg-base-content/30",
  info: "bg-info",
  success: "bg-success",
  warning: "bg-warning",
  error: "bg-error",
}

const PILL: Record<Tone, string> = {
  neutral: "bg-base-content/[0.06] text-base-content/70 ring-base-content/10",
  info: "bg-info/10 text-info ring-info/20",
  success: "bg-success/10 text-success ring-success/20",
  warning: "bg-warning/10 text-warning ring-warning/25",
  error: "bg-error/10 text-error ring-error/20",
}

const CALLOUT: Record<Tone, string> = {
  neutral: "border-base-content/10 bg-base-content/[0.03]",
  info: "border-info/25 bg-info/[0.06]",
  success: "border-success/25 bg-success/[0.06]",
  warning: "border-warning/30 bg-warning/[0.07]",
  error: "border-error/25 bg-error/[0.06]",
}

const CALLOUT_ICON: Record<Tone, string> = {
  neutral: "text-base-content/50",
  info: "text-info",
  success: "text-success",
  warning: "text-warning",
  error: "text-error",
}

// Shared button looks (daisyUI btn sizes, neutral styling)
export const btn = {
  primary: "btn btn-sm border-0 bg-base-content font-medium text-base-100 hover:bg-base-content/85",
  xsPrimary: "btn btn-xs h-7 min-h-7 border-0 bg-base-content px-2.5 font-medium text-base-100 hover:bg-base-content/85",
  secondary:
    "btn btn-sm border-base-content/15 bg-base-100 font-medium shadow-sm hover:border-base-content/25 hover:bg-base-200",
  ghost: "btn btn-sm btn-ghost font-medium",
  xsSecondary:
    "btn btn-xs h-7 min-h-7 border-base-content/15 bg-base-100 px-2.5 font-medium hover:border-base-content/25 hover:bg-base-200",
  xsGhost: "btn btn-xs btn-ghost h-7 min-h-7 px-2 font-medium",
}

export const inputCls = "input input-sm input-bordered border-base-content/15 bg-base-100 placeholder:text-base-content/35"
export const selectCls = "select select-sm select-bordered border-base-content/15 bg-base-100 font-normal"

export const Spinner = ({ className = "" }: { className?: string }) => (
  <span className={`loading loading-spinner loading-xs ${className}`} />
)

export const StatusDot = ({ tone, label, busy }: { tone: Tone; label: ReactNode; busy?: boolean }) => (
  <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-medium text-base-content/80">
    {busy ? (
      <span className="loading loading-spinner h-3 w-3 text-info" />
    ) : (
      <span className={`h-2 w-2 shrink-0 rounded-full ${DOT[tone]}`} />
    )}
    {label}
  </span>
)

export const Pill = ({ tone = "neutral", children, mono, title }: { tone?: Tone; children: ReactNode; mono?: boolean; title?: string }) => (
  <span
    title={title}
    className={`inline-flex items-center whitespace-nowrap rounded px-1.5 py-0.5 text-[11px] font-medium leading-4 ring-1 ring-inset ${PILL[tone]} ${
      mono ? "font-mono" : ""
    }`}
  >
    {children}
  </span>
)

export const Kbd = ({ children }: { children: ReactNode }) => (
  <kbd className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded border border-base-content/15 bg-base-200 px-1 font-mono text-[10px] text-base-content/60">
    {children}
  </kbd>
)

export const SectionLabel = ({ children, right }: { children: ReactNode; right?: ReactNode }) => (
  <div className="flex items-center gap-2">
    <h3 className="text-[11px] font-semibold uppercase tracking-wider text-base-content/50">{children}</h3>
    {right && <div className="ml-auto flex items-center gap-2">{right}</div>}
  </div>
)

export const Crumbs = ({ items }: { items: { label: string; href?: string }[] }) => (
  <nav className="flex items-center gap-1.5 text-xs text-base-content/50">
    {items.map((item, i) => (
      <span key={i} className="flex items-center gap-1.5">
        {i > 0 && <span className="text-base-content/30">/</span>}
        {item.href ? (
          <Link href={item.href} className="hover:text-base-content">
            {item.label}
          </Link>
        ) : (
          <span className="text-base-content/70">{item.label}</span>
        )}
      </span>
    ))}
  </nav>
)

export const PageHeader = ({
  crumbs,
  title,
  meta,
  actions,
  children,
}: {
  crumbs?: { label: string; href?: string }[]
  title: ReactNode
  meta?: ReactNode
  actions?: ReactNode
  children?: ReactNode
}) => (
  <header className="flex flex-col gap-3">
    {crumbs && <Crumbs items={crumbs} />}
    <div className="flex flex-wrap items-start gap-x-6 gap-y-3">
      <div className="min-w-0 flex-1 basis-80">
        <h1 className="flex flex-wrap items-center gap-3 text-xl font-semibold tracking-tight">{title}</h1>
        {meta && <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-base-content/55">{meta}</div>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
    {children}
  </header>
)

export const Dot = () => <span className="text-base-content/25">·</span>

export const Panel = ({
  title,
  count,
  actions,
  children,
  className = "",
  bodyClassName = "",
}: {
  title?: ReactNode
  count?: number
  actions?: ReactNode
  children: ReactNode
  className?: string
  bodyClassName?: string
}) => (
  <section className={`overflow-hidden rounded-lg border border-base-content/10 bg-base-100 shadow-sm ${className}`}>
    {(title || actions) && (
      <div className="flex min-h-[44px] flex-wrap items-center gap-2 border-b border-base-content/10 px-4 py-2">
        {title && (
          <h2 className="text-sm font-semibold">
            {title}
            {count !== undefined && <span className="ml-1.5 font-normal text-base-content/40">{count}</span>}
          </h2>
        )}
        {actions && <div className="ml-auto flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    )}
    <div className={bodyClassName}>{children}</div>
  </section>
)

const ICONS: Record<Tone, ReactNode> = {
  neutral: <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm-.75-11.5a.75.75 0 111.5 0 .75.75 0 01-1.5 0zM9.25 9h1.5v5h-1.5V9z" />,
  info: <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm-.75-11.5a.75.75 0 111.5 0 .75.75 0 01-1.5 0zM9.25 9h1.5v5h-1.5V9z" />,
  success: (
    <path
      fillRule="evenodd"
      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
      clipRule="evenodd"
    />
  ),
  warning: (
    <path
      fillRule="evenodd"
      d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z"
      clipRule="evenodd"
    />
  ),
  error: (
    <path
      fillRule="evenodd"
      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
      clipRule="evenodd"
    />
  ),
}

export const Callout = ({
  tone = "neutral",
  title,
  children,
  action,
  busy,
}: {
  tone?: Tone
  title?: ReactNode
  children?: ReactNode
  action?: ReactNode
  busy?: boolean
}) => (
  <div className={`flex items-start gap-3 rounded-lg border px-3.5 py-3 text-sm ${CALLOUT[tone]}`}>
    {busy ? (
      <span className="loading loading-spinner mt-0.5 h-4 w-4 shrink-0 text-info" />
    ) : (
      <svg viewBox="0 0 20 20" fill="currentColor" className={`mt-0.5 h-4 w-4 shrink-0 ${CALLOUT_ICON[tone]}`}>
        {ICONS[tone]}
      </svg>
    )}
    <div className="min-w-0 flex-1">
      {title && <div className="font-medium">{title}</div>}
      {children && <div className={`${title ? "mt-0.5" : ""} break-words text-base-content/75`}>{children}</div>}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
)

// Collapsed explanation, out of the way until wanted
export const Help = ({ children, label = "How this works" }: { children: ReactNode; label?: string }) => (
  <details className="group text-sm">
    <summary className="inline-flex cursor-pointer select-none list-none items-center gap-1.5 text-xs font-medium text-base-content/50 hover:text-base-content/80 [&::-webkit-details-marker]:hidden">
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.94 6.94a.75.75 0 11-1.061-1.061 3 3 0 112.871 5.026v.345a.75.75 0 01-1.5 0v-.5c0-.72.57-1.172 1.081-1.287A1.5 1.5 0 108.94 6.94zM10 15a1 1 0 100-2 1 1 0 000 2z"
          clipRule="evenodd"
        />
      </svg>
      {label}
      <span className="transition-transform group-open:rotate-90">›</span>
    </summary>
    <div className="mt-2 max-w-3xl space-y-2 rounded-lg border border-base-content/10 bg-base-content/[0.02] px-3.5 py-3 leading-relaxed text-base-content/70">
      {children}
    </div>
  </details>
)

export const Stat = ({ label, value, hint, children }: { label: string; value: ReactNode; hint?: ReactNode; children?: ReactNode }) => (
  <div className="flex min-w-0 flex-col gap-1 px-4 py-3">
    <div className="text-xs font-medium text-base-content/50">{label}</div>
    <div className="text-xl font-semibold tabular-nums tracking-tight">{value}</div>
    {children}
    {hint && <div className="text-xs leading-snug text-base-content/50">{hint}</div>}
  </div>
)

export const StatGrid = ({ children }: { children: ReactNode }) => (
  <div className="grid grid-cols-2 divide-base-content/10 overflow-hidden rounded-lg border border-base-content/10 bg-base-100 shadow-sm max-md:[&>*:nth-child(n+3)]:border-t max-md:[&>*:nth-child(n+3)]:border-base-content/10 max-md:[&>*:nth-child(even)]:border-l md:flex md:divide-x [&>*]:md:flex-1">
    {children}
  </div>
)

export const ProgressBar = ({ value, max, className = "" }: { value: number; max: number; className?: string }) => {
  const pct = max ? Math.round((value / max) * 100) : 0
  return (
    <div className={`h-1.5 overflow-hidden rounded-full bg-base-content/10 ${className}`}>
      <div className={`h-full rounded-full ${pct === 100 ? "bg-success" : "bg-base-content/60"}`} style={{ width: `${pct}%` }} />
    </div>
  )
}

export const EmptyState = ({ title, children }: { title: string; children?: ReactNode }) => (
  <div className="flex flex-col items-center gap-1 px-6 py-10 text-center">
    <div className="text-sm font-medium text-base-content/70">{title}</div>
    {children && <div className="max-w-md text-sm text-base-content/50">{children}</div>}
  </div>
)

export const Tabs = <T extends string>({
  tabs,
  value,
  onChange,
}: {
  tabs: { value: T; label: string; count?: number; tone?: Tone }[]
  value: T
  onChange: (value: T) => void
}) => (
  <div role="tablist" className="flex gap-5 overflow-x-auto border-b border-base-content/10">
    {tabs.map((t) => (
      <button
        key={t.value}
        role="tab"
        aria-selected={value === t.value}
        onClick={() => onChange(t.value)}
        className={`-mb-px flex items-center gap-1.5 whitespace-nowrap border-b-2 pb-2.5 pt-1 text-sm font-medium transition-colors ${
          value === t.value
            ? "border-base-content text-base-content"
            : "border-transparent text-base-content/50 hover:text-base-content/80"
        }`}
      >
        {t.label}
        {t.count !== undefined && (
          <span
            className={`rounded px-1.5 text-[11px] tabular-nums ${
              t.tone === "warning" && t.count > 0 ? "bg-warning/15 text-warning" : "bg-base-content/[0.07] text-base-content/60"
            }`}
          >
            {t.count}
          </span>
        )}
      </button>
    ))}
  </div>
)

// Small segmented control (filters, decisions)
export const Segmented = <T extends string>({
  options,
  value,
  onChange,
  size = "sm",
}: {
  options: { value: T; label: ReactNode; title?: string }[]
  value: T
  onChange: (value: T) => void
  size?: "xs" | "sm"
}) => (
  <div className="inline-flex rounded-md border border-base-content/10 bg-base-content/[0.04] p-0.5">
    {options.map((o) => (
      <button
        key={o.value}
        title={o.title}
        onClick={() => onChange(o.value)}
        className={`flex items-center gap-1 whitespace-nowrap rounded font-medium transition-colors ${
          size === "xs" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs"
        } ${value === o.value ? "bg-base-100 text-base-content shadow-sm" : "text-base-content/55 hover:text-base-content"}`}
      >
        {o.label}
      </button>
    ))}
  </div>
)

export const Modal = ({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  wide,
}: {
  open: boolean
  onClose: () => void
  title: string
  description?: ReactNode
  children: ReactNode
  footer?: ReactNode
  wide?: boolean
}) => {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])
  return (
    <dialog ref={ref} className="modal" onClose={onClose}>
      <div className={`modal-box flex max-h-[90vh] flex-col gap-0 rounded-xl p-0 ${wide ? "max-w-3xl" : "max-w-lg"}`}>
        <div className="flex items-start gap-3 border-b border-base-content/10 px-5 py-4">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold">{title}</h3>
            {description && <p className="mt-0.5 text-sm text-base-content/55">{description}</p>}
          </div>
          <button className="btn btn-circle btn-ghost btn-sm -mr-2 -mt-1" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-4">{children}</div>
        {footer && (
          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-base-content/10 bg-base-content/[0.02] px-5 py-3">
            {footer}
          </div>
        )}
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  )
}

export const Field = ({ label, hint, children, className = "" }: { label: ReactNode; hint?: ReactNode; children: ReactNode; className?: string }) => (
  <label className={`flex flex-col gap-1.5 ${className}`}>
    <span className="text-xs font-medium text-base-content/70">{label}</span>
    {children}
    {hint && <span className="text-xs leading-snug text-base-content/50">{hint}</span>}
  </label>
)

// Label/value rows for detail panels
export const DefList = ({ items }: { items: { label: string; value: ReactNode }[] }) => (
  <dl className="grid grid-cols-1 gap-x-6 gap-y-2.5 text-sm sm:grid-cols-[9rem_minmax(0,1fr)]">
    {items.map((item) => (
      <div key={item.label} className="contents">
        <dt className="text-xs font-medium text-base-content/50 sm:pt-0.5">{item.label}</dt>
        <dd className="min-w-0 break-words">{item.value}</dd>
      </div>
    ))}
  </dl>
)

export const CopyCommand = ({ command }: { command: string }) => (
  <div className="flex items-center gap-2 rounded-md border border-base-content/10 bg-base-100 py-1 pl-3 pr-1 font-mono text-xs">
    <span className="min-w-0 flex-1 truncate">{command}</span>
    <button
      className="btn btn-ghost btn-xs h-6 min-h-6 font-sans"
      onClick={() => navigator.clipboard?.writeText(command)}
      title="Copy to clipboard"
    >
      Copy
    </button>
  </div>
)

export const PageSpinner = () => (
  <div className="flex justify-center p-16">
    <span className="loading loading-spinner loading-md text-base-content/40" />
  </div>
)
