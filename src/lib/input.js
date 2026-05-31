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

// Call once per frame to decay velocity toward zero.
export function updateInput() {
  // ease the reported velocity toward the raw value, then bleed the raw away
  input.scrollVel += (rawVel - input.scrollVel) * 0.2
  rawVel *= 0.85
}
