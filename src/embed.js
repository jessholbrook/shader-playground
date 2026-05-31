import { input } from './lib/input.js'
import { imageDistortion } from './experiments/imageDistortion.js'
import { imageTransition } from './experiments/imageTransition.js'
import { scrollFlow } from './experiments/scrollFlow.js'
import { starNest } from './experiments/starNest.js'
import { tribulence } from './experiments/tribulence.js'

// Chrome-less single-shader page for iframing into other sites.
//   /embed?fx=starNest
//   /embed?fx=imageDistortion&src=https://...        (custom image)
//   /embed?fx=imageTransition&from=https://...&to=https://...
const factories = { imageDistortion, imageTransition, scrollFlow, starNest, tribulence }

const params = new URLSearchParams(location.search)
const fx = params.get('fx') || 'starNest'
const canvas = document.getElementById('gl')

// image effects read their sources from data-* — fill from query params or defaults
canvas.dataset.src = params.get('src') || 'https://picsum.photos/id/1025/1200/800'
canvas.dataset.from = params.get('from') || 'https://picsum.photos/id/1015/1200/800'
canvas.dataset.to = params.get('to') || 'https://picsum.photos/id/1039/1200/800'

const factory = factories[fx] || factories.starNest

// the transition normally scrubs on page scroll; in an embed there's none, so
// drive it from the synthesized scroll value below
const card = fx === 'imageTransition'
  ? factory(canvas, { progress: () => input.scroll })
  : factory(canvas)

// scroll-reactive effects need motion; embeds don't scroll, so ping-pong gently
const animateScroll = fx === 'scrollFlow' || fx === 'imageTransition'
// image distortion is mouse-driven; with no cursor it's static, so auto-roam
// the ripple — but yield to a real mouse for a moment after the user moves it
const animateMouse = fx === 'imageDistortion'
let userMovedAt = -1e9
if (animateMouse) {
  window.addEventListener('mousemove', () => { userMovedAt = performance.now() }, { passive: true })
}

const start = performance.now()
function frame() {
  const now = performance.now()
  const t = (now - start) / 1000
  if (animateScroll) {
    input.scroll = 0.5 - 0.5 * Math.cos(t * 0.25) // 0 → 1 → 0
    input.scrollVel = 0.12 * Math.sin(t * 0.25)
  }
  if (animateMouse && now - userMovedAt > 1500) {
    input.mouse = [0.5 + 0.22 * Math.cos(t * 0.7), 0.5 + 0.18 * Math.sin(t * 1.1)]
  }
  card.render(t)
  requestAnimationFrame(frame)
}
requestAnimationFrame(frame)
