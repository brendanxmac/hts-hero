import { useLayoutEffect, useRef, useState } from "react"

// A box's own size in CSS pixels. offsetWidth/Height ignore the preview player's scale
// transform, so charts are drawn at the post's real size everywhere.
export const useSize = <T extends HTMLElement>() => {
  const ref = useRef<T>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const read = () => setSize({ width: el.offsetWidth, height: el.offsetHeight })
    read()
    const observer = new ResizeObserver(read)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  return { ref, ...size }
}
