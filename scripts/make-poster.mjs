// Capture a single still of a shader embed to a PNG — used for the og:image
// poster (public/og.png). Needs the dev server running (npm run dev).
// Usage: node scripts/make-poster.mjs [fx] [out.png] [w] [h] [warmupMs]
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import puppeteer from 'puppeteer-core'

const [fx = 'tribulence', out = 'public/og.png', W = 1200, H = 630, warmup = 4000] =
  process.argv.slice(2)
const w = Number(W), h = Number(H)

const CHROME = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const URL = `http://localhost:5173/embed.html?fx=${fx}`

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--ignore-gpu-blocklist', '--use-gl=angle', '--hide-scrollbars'],
})
const page = await browser.newPage()
await page.setViewport({ width: w, height: h, deviceScaleFactor: 1 })
await page.goto(URL, { waitUntil: 'networkidle0' })
await new Promise((r) => setTimeout(r, Number(warmup))) // let the shader reach a good moment

const png = await page.screenshot({ type: 'png' })
await browser.close()

mkdirSync(dirname(out), { recursive: true })
writeFileSync(out, png)
console.log(`wrote ${out} — ${w}x${h}, ${(png.length / 1024).toFixed(0)} kB`)
