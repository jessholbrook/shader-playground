import { updateInput } from './lib/input.js'
import { imageDistortion } from './experiments/imageDistortion.js'
import { imageTransition } from './experiments/imageTransition.js'
import { scrollFlow } from './experiments/scrollFlow.js'
import { starNest } from './experiments/starNest.js'
import { tribulence } from './experiments/tribulence.js'
import { enableImageUpload } from './lib/upload.js'

// Each <canvas data-fx="..."> on the page becomes a live shader card.
const factories = { imageDistortion, imageTransition, scrollFlow, starNest, tribulence }

const cards = [...document.querySelectorAll('canvas[data-fx]')].map((canvas) => {
  const factory = factories[canvas.dataset.fx]
  const card = factory(canvas)

  // wire browser-side image upload onto the cards that use textures
  if (card.setImage && canvas.dataset.fx === 'imageDistortion') {
    enableImageUpload(canvas.parentElement, [{ key: 'img', label: 'upload image' }],
      (_, url) => card.setImage(url))
  } else if (card.setImage && canvas.dataset.fx === 'imageTransition') {
    enableImageUpload(canvas.parentElement,
      [{ key: 'from', label: 'image A' }, { key: 'to', label: 'image B' }],
      (slot, url) => card.setImage(slot, url))
  }

  return card
})

// Respect prefers-reduced-motion: freeze shader time so every card renders
// as a still. Scroll- and mouse-scrubbed responses stay (direct manipulation).
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)')
const FROZEN_T = 12 // an arbitrary moment that looks good on every effect

// one shared render loop drives every card
const start = performance.now()
let last = start
function frame() {
  const now = performance.now()
  const dt = Math.min((now - last) / 1000, 0.1) // clamp across tab switches
  last = now
  updateInput(dt)
  const t = reducedMotion.matches ? FROZEN_T : (now - start) / 1000
  for (const card of cards) card.render(t, dt)
  requestAnimationFrame(frame)
}
requestAnimationFrame(frame)
