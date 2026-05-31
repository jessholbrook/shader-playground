// Helpers shared by the on-page effect cards.

const DPR = Math.min(window.devicePixelRatio || 1, 2)

// Size a renderer's drawing buffer to its canvas's container (the <figure>).
// Returns true when the size changed, so the effect can refresh uResolution.
export function fitCanvas(renderer, canvas) {
  const host = canvas.parentElement
  const w = Math.round(host.clientWidth)
  const h = Math.round(host.clientHeight)
  if (w === renderer._w && h === renderer._h) return false
  renderer.setSize(w, h)
  renderer._w = w
  renderer._h = h
  return true
}

// Skip rendering cards that are well off-screen (saves GPU + battery).
export function inView(canvas, margin = 200) {
  const r = canvas.getBoundingClientRect()
  return r.bottom > -margin && r.top < window.innerHeight + margin
}

// 0 when the element's center sits at the bottom of the viewport,
// 1 when it reaches the top. The natural "scrub as you scroll" driver.
export function viewportProgress(el) {
  const r = el.getBoundingClientRect()
  const center = r.top + r.height / 2
  const p = (window.innerHeight - center) / window.innerHeight
  return Math.min(1, Math.max(0, p))
}

// Mouse position relative to an element, 0..1 with y up. inside=false when out.
export function localMouse(el, mouse) {
  const r = el.getBoundingClientRect()
  const px = mouse[0] * window.innerWidth
  const py = (1 - mouse[1]) * window.innerHeight
  const rx = (px - r.left) / r.width
  const ry = (py - r.top) / r.height
  const inside = rx >= 0 && rx <= 1 && ry >= 0 && ry <= 1
  return { uv: [rx, 1 - ry], inside }
}

export { DPR }
