import { Renderer, Triangle, Program, Mesh } from 'ogl'
import vertex from '../shaders/base300.vert?raw'
import fragment from '../shaders/tribulence.frag?raw'
import { fitCanvas, inView } from '../lib/card.js'

// Tribulence 3D by chronos, ported from Shadertoy. A raymarched volumetric
// SDF warped by FM noise; time-driven, no interaction needed.
// Requires a WebGL2 context (GLSL ES 3.0). It's a heavy raymarcher, so we
// cap the device-pixel-ratio to keep the shared render loop responsive.
export function tribulence(canvas) {
  const renderer = new Renderer({ canvas, dpr: 1, alpha: false })
  const gl = renderer.gl

  // OGL silently falls back to WebGL1 on old devices, where the GLSL ES 3.0
  // shader can't compile — show a note instead of a black card
  if (typeof WebGL2RenderingContext === 'undefined' || !(gl instanceof WebGL2RenderingContext)) {
    const note = document.createElement('p')
    note.className = 'fx-note'
    note.textContent = 'this effect needs WebGL2, which this browser doesn’t support'
    canvas.parentElement.append(note)
    return { render() {} }
  }

  const geometry = new Triangle(gl)
  const program = new Program(gl, {
    vertex,
    fragment,
    uniforms: {
      uResolution: { value: [1, 1] },
      uTime: { value: 0 },
    },
  })
  const mesh = new Mesh(gl, { geometry, program })

  function render(t) {
    if (!inView(canvas)) return
    if (fitCanvas(renderer, canvas)) {
      program.uniforms.uResolution.value = [gl.canvas.width, gl.canvas.height]
    }
    program.uniforms.uTime.value = t
    renderer.render({ scene: mesh })
  }

  return { render }
}
