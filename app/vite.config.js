import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

// base '/' 전제 = 조직 루트 사이트(<org>.github.io repo)로 배포.
// 프로젝트 사이트(<org>.github.io/<repo>)로 가면 base를 '/<repo>/'로 변경할 것.
// MPA: /about/·/join/은 별도 HTML 엔트리(dist/<dir>/index.html) — GitHub Pages가 디렉터리 index로 서빙.
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        about: fileURLToPath(new URL('./about/index.html', import.meta.url)),
        join: fileURLToPath(new URL('./join/index.html', import.meta.url)),
        log: fileURLToPath(new URL('./log/index.html', import.meta.url)),
        reports: fileURLToPath(new URL('./reports/index.html', import.meta.url)),
      },
    },
  },
})
