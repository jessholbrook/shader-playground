import { Renderer, Triangle, Program, Mesh } from 'ogl'
import vertex from '../shaders/base.vert?raw'
import fragment from '../shaders/scrollFlow.frag?raw'
import { input } from '../lib/input.js'
import { fitCanvas, inView, localMouse, DPR } from '../lib/card.js'

// A fractal-noise field driven by page scroll progress + velocity, with the
// mouse pulling the flow. Rendered into its own card.
export function scrollFlow(canvas) {
  const renderer = new Renderer({ canvas, dpr: DPR, alpha: false })
  const gl = renderer.gl

  const geometry = new Triangle(gl)
  const program = new Program(gl, {
    vertex,
    fragment,
    uniforms: {
      uResolution: { value: [1, 1] },
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uScrollVel: { value: 0 },
      uMouse: { value: [0.5, 0.5] },
    },
  })
  const mesh = new Mesh(gl, { geometry, program })

  function render(t) {
    if (!inView(canvas)) return
    if (fitCanvas(renderer, canvas)) {
      program.uniforms.uResolution.value = [gl.canvas.width, gl.canvas.height]
    }
    program.uniforms.uTime.value = t
    program.uniforms.uScroll.value = input.scroll
    program.uniforms.uScrollVel.value = input.scrollVel
    program.uniforms.uMouse.value = localMouse(canvas, input.mouse).uv
    renderer.render({ scene: mesh })
  }

  return { render }
}
