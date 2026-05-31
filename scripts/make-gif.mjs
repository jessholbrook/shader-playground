// Capture an animated shader embed to a looping GIF.
// Usage: node scripts/make-gif.mjs <fx> <out.gif> [frames] [intervalMs] [w] [h] [speed]
// Build-time only (puppeteer-core / pngjs / gifenc installed with --no-save).
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import puppeteer from 'puppeteer-core'
import { PNG } from 'pngjs'
import gifenc from 'gifenc'
const { GIFEncoder, quantize, applyPalette } = gifenc

const [fx = 'tribulence', out = 'docs/hero.gif', framesN = 24, interval = 90, W = 480, H = 270, spd = 1, cols = 256] =
  process.argv.slice(2)
const frames = Number(framesN), iv = Number(interval), w = Number(W), h = Number(H)
const speed = Number(spd), colors = Number(cols)

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const URL = `http://localhost:5173/embed.html?fx=${fx}&speed=${speed}`

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--ignore-gpu-blocklist', '--use-gl=angle', '--hide-scrollbars'],
})
const page = await browser.newPage()
await page.setViewport({ width: w, height: h, deviceScaleFactor: 1 })
await page.goto(URL, { waitUntil: 'networkidle0' })
await sleep(900) // let the shader warm up

console.log(`capturing ${frames} frames of "${fx}" at ${w}x${h} …`)
const shots = []
for (let i = 0; i < frames; i++) {
  shots.push(PNG.sync.read(Buffer.from(await page.screenshot({ type: 'png' }))))
  await sleep(iv)
}
await browser.close()

// boomerang so the loop is seamless regardless of content
const order = [...shots.keys(), ...[...shots.keys()].reverse().slice(1, -1)]

const gif = GIFEncoder()
for (const i of order) {
  const { data } = shots[i]
  const palette = quantize(data, colors)
  const index = applyPalette(data, palette)
  gif.writeFrame(index, w, h, { palette, delay: 70 })
}
gif.finish()

mkdirSync(dirname(out), { recursive: true })
writeFileSync(out, gif.bytes())
console.log(`wrote ${out} — ${order.length} frames, ${(gif.bytes().length / 1024 / 1024).toFixed(2)} MB`)
