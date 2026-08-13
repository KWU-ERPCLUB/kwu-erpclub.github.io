// 세미나 인쇄판(PDF) 생성 — 최종 산출물 계약(2026-08-13 오너: "세미나용은 PDF까지가 최종 산출물").
// 사용: npm run build 후 `node scripts/export-seminar-pdf.mjs <슬러그...>` (인자 없으면 content/세미나 전 건).
// 원리: dist를 내장 http로 서빙 → 헤드리스 Chrome이 상세(?p=슬러그)를 인쇄(@media print, seminars.css)
//       → public/pdf/세미나/<슬러그>.pdf 저장. 외부 패키지 0. 생성 후 재빌드해야 dist에 실린다.
// 주의: 생성물은 커밋 대상(정적 서빙). frontmatter `pdf: /pdf/세미나/<슬러그>.pdf`로 상세에 버튼이 뜬다.
import { createServer } from 'node:http'
import { readFileSync, readdirSync, existsSync, mkdirSync, statSync } from 'node:fs'
import { join, extname, resolve } from 'node:path'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

// ⚠동기 실행(execFileSync) 금지 — 같은 프로세스의 http 서버 이벤트 루프를 막아 Chrome이 페이지를 못 받는다(2026-08-13 실측 ETIMEDOUT)
const run = promisify(execFile)

const APP = resolve(import.meta.dirname, '..')
const DIST = join(APP, 'dist')
const OUT = join(APP, 'public', 'pdf', '세미나')
const CHROME = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].find(existsSync)

if (!CHROME) { console.error('Chrome 실행 파일을 찾지 못함'); process.exit(1) }
if (!existsSync(join(DIST, 'seminars', 'index.html'))) { console.error('dist 없음 — 먼저 npm run build'); process.exit(1) }

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.pdf': 'application/pdf', '.xml': 'application/xml' }

const slugs = process.argv.slice(2).length
  ? process.argv.slice(2)
  : readdirSync(join(APP, 'content', '세미나')).filter((f) => f.endsWith('.md') && !f.startsWith('_')).map((f) => f.replace(/\.md$/, ''))

const server = createServer((req, res) => {
  const clean = decodeURIComponent(req.url.split('?')[0])
  let file = join(DIST, clean)
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html')
  if (!existsSync(file)) file = join(DIST, 'index.html')
  res.writeHead(200, { 'content-type': MIME[extname(file)] || 'application/octet-stream' })
  res.end(readFileSync(file))
})

server.listen(0, '127.0.0.1', async () => {
  const port = server.address().port
  mkdirSync(OUT, { recursive: true })
  try {
    for (const slug of slugs) {
      const out = join(OUT, `${slug}.pdf`)
      const url = `http://127.0.0.1:${port}/seminars/?p=${slug}`
      // user-data-dir 분리 — 사용 중인 Chrome 프로필과 격리
      await run(CHROME, [
        '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
        `--user-data-dir=${join(process.env.TEMP || '/tmp', 'seminar-pdf-profile')}`,
        `--print-to-pdf=${out}`, '--no-pdf-header-footer', '--virtual-time-budget=8000', url,
      ], { timeout: 120000 })
      console.log(`PDF written: ${out}`)
    }
  } finally {
    server.close()
  }
})
