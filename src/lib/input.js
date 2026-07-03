// Shared input state: scroll progress + velocity, and mouse position.
// Experiments read from this instead of each wiring their own listeners.

export const input = {
  scroll: 0,        // 0..1 progress down the page
  scrollVel: 0,     // smoothed signed velocity, roughly -1..1
  mouse: [0.5, 0.5],// 0..1, y up
}

let lastScroll = window.scrollY
let rawVel = 0

function onScroll() {
  const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
  input.scroll = window.scrollY / max
  rawVel = (window.scrollY - lastScroll) / window.innerHeight
  lastScroll = window.scrollY
}

function onMouse(e) {
  input.mouse[0] = e.clientX / window.innerWidth
  input.mouse[1] = 1 - e.clientY / window.innerHeight
}

window.addEventListener('scroll', onScroll, { passive: true })
window.addEventListener('mousemove', onMouse, { passive: true })
onScroll() // seed scroll progress: the page may load mid-scroll (anchor, restore)

// Call once per frame to decay velocity toward zero. Easing rates are tuned
// for 60Hz and rescaled by dt so 120Hz displays feel the same.
export function updateInput(dt = 1 / 60) {
  const f = dt * 60
  input.scrollVel += (rawVel - input.scrollVel) * (1 - Math.pow(0.8, f))
  rawVel *= Math.pow(0.85, f)
}
