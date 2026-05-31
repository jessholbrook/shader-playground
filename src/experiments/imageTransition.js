import { Renderer, Triangle, Program, Mesh, Texture } from 'ogl'
import vertex from '../shaders/base.vert?raw'
import fragment from '../shaders/imageTransition.frag?raw'
import { fitCanvas, inView, viewportProgress, DPR } from '../lib/card.js'

// Two images; scrolling the card through the viewport dissolves one into
// the other. Image urls come from data-from / data-to.
export function imageTransition(canvas, opts = {}) {
  // progress source: defaults to scroll position, overridable (e.g. embed mode)
  const getProgress = opts.progress || (() => viewportProgress(canvas))
  const renderer = new Renderer({ canvas, dpr: DPR, alpha: false })
  const gl = renderer.gl
  gl.clearColor(0.043, 0.043, 0.059, 1)

  const geometry = new Triangle(gl)
  const tFrom = new Texture(gl)
  const tTo = new Texture(gl)
  const program = new Program(gl, {
    vertex,
    fragment,
    uniforms: {
      tFrom: { value: tFrom },
      tTo: { value: tTo },
      uFromSize: { value: [1, 1] },
      uToSize: { value: [1, 1] },
      uPlaneSize: { value: [1, 1] },
      uProgress: { value: 0 },
      uTime: { value: 0 },
    },
  })
  const mesh = new Mesh(gl, { geometry, program })

  loadInto(canvas.dataset.from, tFrom, program.uniforms.uFromSize)
  loadInto(canvas.dataset.to, tTo, program.uniforms.uToSize)

  function loadInto(src, tex, sizeUniform) {
    const im = new Image()
    im.crossOrigin = 'anonymous'
    im.onload = () => {
      tex.image = im
      sizeUniform.value = [im.naturalWidth, im.naturalHeight]
      if (src.startsWith('blob:')) URL.revokeObjectURL(src)
    }
    im.src = src
  }

  // swap either image live: slot 'from' or 'to' (remote url or local blob:)
  function setImage(slot, src) {
    if (slot === 'to') loadInto(src, tTo, program.uniforms.uToSize)
    else loadInto(src, tFrom, program.uniforms.uFromSize)
  }

  function render(t) {
    if (!inView(canvas)) return
    fitCanvas(renderer, canvas)
    program.uniforms.uPlaneSize.value = [renderer._w, renderer._h]
    program.uniforms.uTime.value = t
    program.uniforms.uProgress.value = getProgress()
    renderer.render({ scene: mesh })
  }

  return { render, setImage }
}
