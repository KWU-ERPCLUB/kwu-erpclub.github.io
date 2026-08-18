import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { readFileSync } from 'node:fs'

// 버전 = package.json 단일원천(릴리스 체계 spec §6). 화면에 숫자를 하드코딩하지 않는다.
const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'))

export default defineConfig({
  plugins: [react()],
  base: '/',
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        insights: fileURLToPath(new URL('./insights/index.html', import.meta.url)),
        seminars: fileURLToPath(new URL('./seminars/index.html', import.meta.url)),
        recruit: fileURLToPath(new URL('./recruit/index.html', import.meta.url)),
        projects: fileURLToPath(new URL('./projects/index.html', import.meta.url)),
        projectsAdsp: fileURLToPath(new URL('./projects/adsp/index.html', import.meta.url)),
        workspace: fileURLToPath(new URL('./workspace/index.html', import.meta.url)),
      },
    },
  },
})
