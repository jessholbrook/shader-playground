import { defineConfig } from 'vite'

// Two entry points:
//  index.html  — the scrolling gallery
//  embed.html  — a single chrome-less shader for iframing (/embed?fx=...)
// Shaders live in .glsl files and are imported with `?raw` (built into Vite).
export default defineConfig({
  server: { open: true },
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        embed: 'embed.html',
      },
    },
  },
})
