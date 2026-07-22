import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'

// 멤버 개인 페이지 = members/<id>/index.html 자동 엔트리 (SPEC §7 — 폴더 추가만으로 페이지 생성)
const membersDir = fileURLToPath(new URL('./members', import.meta.url))
const memberEntries = {}
if (existsSync(membersDir)) {
  for (const d of readdirSync(membersDir, { withFileTypes: true })) {
    const html = join(membersDir, d.name, 'index.html')
    if (d.isDirectory() && existsSync(html)) memberEntries[`member-${d.name}`] = html
  }
}

export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        articles: fileURLToPath(new URL('./articles/index.html', import.meta.url)),
        seminars: fileURLToPath(new URL('./seminars/index.html', import.meta.url)),
        labs: fileURLToPath(new URL('./labs/index.html', import.meta.url)),
        about: fileURLToPath(new URL('./about/index.html', import.meta.url)),
        join: fileURLToPath(new URL('./join/index.html', import.meta.url)),
        log: fileURLToPath(new URL('./log/index.html', import.meta.url)),
        reports: fileURLToPath(new URL('./reports/index.html', import.meta.url)),
        projects: fileURLToPath(new URL('./projects/index.html', import.meta.url)),
        membersIndex: fileURLToPath(new URL('./members/index.html', import.meta.url)),
        ...memberEntries,
      },
    },
  },
})
