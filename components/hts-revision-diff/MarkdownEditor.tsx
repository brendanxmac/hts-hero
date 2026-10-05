"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import dynamic from "next/dynamic"
import toast from "react-hot-toast"
import {
  Decoration,
  EditorView,
  keymap,
  MatchDecorator,
  Prec,
  ViewPlugin,
  WidgetType,
  type DecorationSet,
  type ViewUpdate,
} from "@uiw/react-codemirror"
import { api } from "./shared"
import { btn, Help, inputCls, Panel, Pill, Spinner } from "./ui"

const CodeMirror = dynamic(() => import("@uiw/react-codemirror"), { ssr: false })

// datalab's page separator: "{366}------" comes before PDF page 367
const PAGE_SEPARATOR = /^\{(\d+)\}-{6,}\s*$/

interface Loaded {
  text: string
  version: string
  edited: boolean
}

// Shows each page separator as a "PDF page n" divider that the cursor skips,
// so separators (which the parser needs) can't be edited by accident
class PageBreak extends WidgetType {
  constructor(readonly page: number) {
    super()
  }
  eq(other: PageBreak) {
    return other.page === this.page
  }
  toDOM() {
    const el = document.createElement("div")
    el.className = "cm-page-break"
    el.textContent = `PDF page ${this.page}`
    return el
  }
}

const pageBreaks = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet
    matcher = new MatchDecorator({
      regexp: /^\{(\d+)\}-{6,}[ \t]*$/gm,
      decoration: (m) => Decoration.replace({ widget: new PageBreak(Number(m[1]) + 1) }),
    })
    constructor(view: EditorView) {
      this.decorations = this.matcher.createDeco(view)
    }
    update(update: ViewUpdate) {
      this.decorations = this.matcher.updateDeco(update, this.decorations)
    }
  },
  {
    decorations: (v) => v.decorations,
    provide: (plugin) => EditorView.atomicRanges.of((view) => view.plugin(plugin)?.decorations ?? Decoration.none),
  }
)

const editorTheme = EditorView.theme({
  "&": { backgroundColor: "transparent", color: "inherit", fontSize: "12px", height: "100%" },
  ".cm-scroller": { fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", lineHeight: "1.6" },
  ".cm-gutters": { backgroundColor: "transparent", color: "inherit", opacity: "0.35", border: "none" },
  ".cm-activeLine, .cm-activeLineGutter": { backgroundColor: "rgba(127,127,127,0.07)" },
  ".cm-cursor": { borderLeftColor: "currentColor" },
  ".cm-page-break": {
    margin: "6px 0",
    padding: "2px 8px",
    borderTop: "1px dashed rgba(127,127,127,0.45)",
    fontFamily: "ui-sans-serif, system-ui, sans-serif",
    fontSize: "11px",
    fontWeight: "600",
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    opacity: "0.55",
  },
  ".cm-panels": { backgroundColor: "transparent", color: "inherit" },
  ".cm-searchMatch": { backgroundColor: "rgba(250,204,21,0.35)" },
  ".cm-searchMatch-selected": { backgroundColor: "rgba(249,115,22,0.45)" },
})

// The PDF page the given document line is on
const pageAtLine = (view: EditorView, lineNumber: number) => {
  for (let n = lineNumber; n >= 1; n--) {
    const m = view.state.doc.line(n).text.trim().match(PAGE_SEPARATOR)
    if (m) return Number(m[1]) + 1
  }
  return null
}

// Edits the whole Chapter 99 markdown, to put back text the conversion
// dropped. `openPage` scrolls to a page picked elsewhere (a warning's page);
// a new object each time so the same page can be opened again.
export default function MarkdownEditor({
  attemptId,
  pageCount,
  visible,
  openPage,
  onReparse,
}: {
  attemptId: string
  pageCount: number | null
  visible: boolean
  openPage: { page: number } | null
  onReparse: () => Promise<void>
}) {
  const [loaded, setLoaded] = useState<Loaded | null>(null)
  const [loadCount, setLoadCount] = useState(0)
  const [dirty, setDirty] = useState(false)
  const [busy, setBusy] = useState<"load" | "save" | "reparse" | null>("load")
  const [pageInput, setPageInput] = useState("")
  const [cursorPage, setCursorPage] = useState<number | null>(null)
  const viewRef = useRef<EditorView | null>(null)
  const pendingPage = useRef<number | null>(null)
  const latest = useRef({ dirty, loaded, busy })
  latest.current = { dirty, loaded, busy }

  const load = useCallback(async () => {
    setBusy("load")
    try {
      const result = await api<Loaded>(`/attempts/${attemptId}/markdown`)
      viewRef.current = null
      setLoaded(result)
      setDirty(false)
      setLoadCount((c) => c + 1)
    } catch (error) {
      toast.error((error as Error).message)
    } finally {
      setBusy(null)
    }
  }, [attemptId])

  useEffect(() => {
    load()
  }, [load])

  const goToPage = useCallback((page: number) => {
    const view = viewRef.current
    if (!view) {
      pendingPage.current = page
      return
    }
    const doc = view.state.doc
    for (let n = 1; n <= doc.lines; n++) {
      const m = doc.line(n).text.trim().match(PAGE_SEPARATOR)
      if (m && Number(m[1]) + 1 === page) {
        // Cursor on the page's first line, with its divider at the top
        const at = n < doc.lines ? doc.line(n + 1).from : doc.line(n).to
        view.dispatch({
          selection: { anchor: at },
          effects: EditorView.scrollIntoView(doc.line(n).from, { y: "start", yMargin: 4 }),
        })
        view.focus()
        return
      }
    }
    toast.error(`Page ${page} isn't in the markdown`)
  }, [])

  // Opening a page from a warning; waits for the editor and for the tab to show
  useEffect(() => {
    if (!openPage) return
    setPageInput(String(openPage.page))
    requestAnimationFrame(() => goToPage(openPage.page))
  }, [openPage, goToPage])

  // A hidden editor can't measure itself; remeasure when shown
  useEffect(() => {
    if (visible) viewRef.current?.requestMeasure()
  }, [visible])

  // Warn before leaving the page with unsaved edits
  useEffect(() => {
    if (!dirty) return
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ""
    }
    window.addEventListener("beforeunload", onBeforeUnload)
    return () => window.removeEventListener("beforeunload", onBeforeUnload)
  }, [dirty])

  // Saves if there's anything to save; returns whether the file is now saved
  const save = useCallback(async () => {
    const { loaded, dirty } = latest.current
    const view = viewRef.current
    if (!loaded || !view) return false
    if (!dirty) return true
    setBusy("save")
    try {
      const text = view.state.doc.toString()
      const result = await api<{ version: string; edited: boolean }>(`/attempts/${attemptId}/markdown`, {
        method: "PUT",
        body: JSON.stringify({ text, baseVersion: loaded.version }),
      })
      setLoaded({ text, version: result.version, edited: result.edited })
      setDirty(false)
      return true
    } catch (error) {
      toast.error((error as Error).message, { duration: 8000 })
      return false
    } finally {
      setBusy(null)
    }
  }, [attemptId])

  const saveAndReparse = async () => {
    if (!(await save())) return
    setBusy("reparse")
    try {
      await onReparse()
    } finally {
      setBusy(null)
    }
  }

  const discard = () => {
    if (window.confirm("Discard your unsaved edits?")) load()
  }

  const extensions = useMemo(
    () => [
      editorTheme,
      pageBreaks,
      EditorView.lineWrapping,
      Prec.highest(
        keymap.of([
          {
            key: "Mod-s",
            preventDefault: true,
            run: () => {
              if (!latest.current.busy) {
                save().then((ok) => ok && latest.current.loaded && toast.success("Saved. Re-parse to use it."))
              }
              return true
            },
          },
        ])
      ),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) setDirty(true)
        if (update.selectionSet || update.docChanged) {
          setCursorPage(pageAtLine(update.view, update.state.doc.lineAt(update.state.selection.main.head).number))
        }
      }),
    ],
    [save]
  )

  return (
    <Panel
      title="Chapter 99 markdown"
      actions={
        <div className="flex flex-wrap items-center gap-1.5">
          {loaded?.edited && <Pill tone="neutral">Edited</Pill>}
          {dirty && <Pill tone="warning">Unsaved</Pill>}
          <form
            className="flex items-center gap-1.5"
            onSubmit={(e) => {
              e.preventDefault()
              if (pageInput) goToPage(Number(pageInput))
            }}
          >
            <input
              className={`${inputCls} input-xs h-7 w-20`}
              type="number"
              min={1}
              max={pageCount ?? undefined}
              placeholder="Page"
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
            />
            <button className={btn.xsSecondary} type="submit" disabled={!pageInput || !loaded}>
              Go
            </button>
          </form>
          {dirty && (
            <button className={btn.xsGhost} disabled={busy !== null} onClick={discard}>
              Discard
            </button>
          )}
          <button
            className={btn.xsSecondary}
            disabled={!dirty || busy !== null}
            onClick={() => save().then((ok) => ok && toast.success("Saved. Re-parse to use it."))}
          >
            {busy === "save" && <Spinner />}
            Save
          </button>
          <button className={btn.xsPrimary} disabled={!loaded || busy !== null} onClick={saveAndReparse}>
            {busy === "reparse" && <Spinner />}
            {dirty ? "Save & re-parse" : "Re-parse"}
          </button>
        </div>
      }
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-base-content/10 px-4 py-2">
        <Help label="Editing the markdown">
          This is the whole file datalab produced. Fix what it got wrong, like a note number it dropped, then save and
          re-parse. Search with ⌘F, save with ⌘S. Dashed dividers mark where each PDF page starts; click a warning&apos;s page
          to jump there. The first save keeps datalab&apos;s original as a separate file.
        </Help>
        {cursorPage && <span className="text-xs tabular-nums text-base-content/45">Cursor on PDF page {cursorPage}</span>}
      </div>
      <div className="h-[calc(100vh-14rem)] min-h-[28rem]">
        {loaded ? (
          <CodeMirror
            key={loadCount}
            value={loaded.text}
            height="100%"
            theme="none"
            extensions={extensions}
            basicSetup={{ foldGutter: false, highlightActiveLine: true, searchKeymap: true }}
            onCreateEditor={(view) => {
              viewRef.current = view
              if (pendingPage.current) {
                const page = pendingPage.current
                pendingPage.current = null
                requestAnimationFrame(() => goToPage(page))
              }
            }}
            className="h-full"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-base-content/50">
            {busy === "load" ? <Spinner /> : "Couldn't load the markdown."}
          </div>
        )}
      </div>
    </Panel>
  )
}
