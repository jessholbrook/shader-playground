import { Renderer, Triangle, Program, Mesh, Texture } from 'ogl'
import vertex from '../shaders/base.vert?raw'
import fragment from '../shaders/imageDistortion.frag?raw'
import { input } from '../lib/input.js'
import { fitCanvas, inView, localMouse, DPR } from '../lib/card.js'

// Mouse-reactive ripple + chromatic aberration over an image.
// Each card owns its own canvas; the image url comes from data-src.
export function imageDistortion(canvas) {
  const renderer = new Renderer({ canvas, dpr: DPR, alpha: false })
  const gl = renderer.gl
  gl.clearColor(0.043, 0.043, 0.059, 1)

  const geometry = new Triangle(gl)
  const texture = new Texture(gl)
  const program = new Program(gl, {
    vertex,
    fragment,
    uniforms: {
      tMap: { value: texture },
      uImageSize: { value: [1, 1] },
      uPlaneSize: { value: [1, 1] },
      uTime: { value: 0 },
      uMouse: { value: [0.5, 0.5] },
      uHover: { value: 0 },
      uScrollVel: { value: 0 },
    },
  })
  const mesh = new Mesh(gl, { geometry, program })

  // load an image (remote url or a local blob: url from an upload) into tMap
  function setImage(src) {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      texture.image = img
      program.uniforms.uImageSize.value = [img.naturalWidth, img.naturalHeight]
      if (src.startsWith('blob:')) URL.revokeObjectURL(src)
    }
    img.src = src
  }
  setImage(canvas.dataset.src)

  let hover = 0

  function render(t) {
    if (!inView(canvas)) return
    fitCanvas(renderer, canvas)
    program.uniforms.uPlaneSize.value = [renderer._w, renderer._h]
    program.uniforms.uTime.value = t
    program.uniforms.uScrollVel.value = input.scrollVel

    const m = localMouse(canvas, input.mouse)
    program.uniforms.uMouse.value = m.uv
    hover += ((m.inside ? 1 : 0) - hover) * 0.08
    program.uniforms.uHover.value = hover

    renderer.render({ scene: mesh })
  }

  return { render, setImage }
}
