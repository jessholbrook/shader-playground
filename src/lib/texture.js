// Image → OGL texture loading, shared by the photo effects.
// Handles the failure cases the happy path ignores: a placeholder host being
// down, a bad ?src= on the embed, or a corrupt dropped file. On error we fall
// back to the card's default image, and if that fails too, to a procedural
// gradient so the card never renders as a dead black box.
export function loadInto(src, texture, sizeUniform, fallbackSrc) {
  if (!src) return applyFallback(texture, sizeUniform)
  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.onload = () => {
    texture.image = img
    sizeUniform.value = [img.naturalWidth, img.naturalHeight]
    if (src.startsWith('blob:')) URL.revokeObjectURL(src)
  }
  img.onerror = () => {
    if (src.startsWith('blob:')) URL.revokeObjectURL(src)
    console.warn(`[shader] image failed to load: ${src}`)
    if (fallbackSrc && fallbackSrc !== src) loadInto(fallbackSrc, texture, sizeUniform)
    else applyFallback(texture, sizeUniform)
  }
  img.src = src
}

function applyFallback(texture, sizeUniform) {
  const c = document.createElement('canvas')
  c.width = c.height = 256
  const g = c.getContext('2d')
  const grad = g.createLinearGradient(0, 0, 256, 256)
  grad.addColorStop(0, '#16161e')
  grad.addColorStop(1, '#2c2c44')
  g.fillStyle = grad
  g.fillRect(0, 0, 256, 256)
  texture.image = c
  sizeUniform.value = [256, 256]
}
