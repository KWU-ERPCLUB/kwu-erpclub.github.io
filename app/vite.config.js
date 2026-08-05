import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        insights: fileURLToPath(new URL('./insights/index.html', import.meta.url)),
        seminars: fileURLToPath(new URL('./seminars/index.html', import.meta.url)),
        recruit: fileURLToPath(new URL('./recruit/index.html', import.meta.url)),
        log: fileURLToPath(new URL('./log/index.html', import.meta.url)),
        projects: fileURLToPath(new URL('./projects/index.html', import.meta.url)),
        workspace: fileURLToPath(new URL('./workspace/index.html', import.meta.url)),
      },
    },
  },
})
