// Browser-side image upload for a card. No server: a picked File becomes a
// local object URL (blob:) fed straight into the shader's texture.
// slots: [{ key, label }] — one button per slot, plus drag-drop onto the figure.
// onPick(key, objectUrl) fires when an image is chosen or dropped.
export function enableImageUpload(figure, slots, onPick) {
  figure.classList.add('uploadable')

  const bar = document.createElement('div')
  bar.className = 'upload-bar'

  for (const slot of slots) {
    const label = document.createElement('label')
    label.className = 'upload-btn'
    label.append(slot.label)
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.addEventListener('change', () => {
      const file = input.files && input.files[0]
      if (file) onPick(slot.key, URL.createObjectURL(file))
      input.value = '' // allow re-picking the same file
    })
    label.append(input)
    bar.append(label)
  }
  figure.append(bar)

  // drag-and-drop anywhere on the figure → first slot
  const stop = (e) => { e.preventDefault(); e.stopPropagation() }
  figure.addEventListener('dragenter', (e) => { stop(e); figure.classList.add('drag') })
  figure.addEventListener('dragover', (e) => { stop(e); figure.classList.add('drag') })
  figure.addEventListener('dragleave', (e) => { stop(e); figure.classList.remove('drag') })
  figure.addEventListener('drop', (e) => {
    stop(e)
    figure.classList.remove('drag')
    const files = e.dataTransfer ? [...e.dataTransfer.files] : []
    const img = files.find((f) => f.type.startsWith('image/'))
    if (img) onPick(slots[0].key, URL.createObjectURL(img))
  })
}
