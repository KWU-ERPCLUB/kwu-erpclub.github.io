// 세미나 슬라이드 덱(public/slides/<덱>/) → 인쇄판 PDF(public/pdf/세미나/<슬러그>.pdf).
// 2026-08-14 개정: 세미나 PDF 원천 = 상세 페이지 줄글 인쇄(export-seminar-pdf.mjs)에서 발표자료 덱 인쇄로 교체
// (오너 지시 — "PPT같이 구성하고 캡처 적극 활용"). 덱 @media print가 슬라이드당 1페이지(1280×720)를 보장한다.
// 사용: node scripts/export-deck-pdf.mjs [덱=슬러그 ...] (인자 없으면 DECKS 전 건). 빌드 불필요 — public/을 직접 서빙.
import { createServer } from 'node:http'
import { readFileSync, existsSync, mkdirSync, statSync } from 'node:fs'
import { join, extname, resolve } from 'node:path'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const run = promisify(execFile)

const APP = resolve(import.meta.dirname, '..')
const PUB = join(APP, 'public')
const OUT = join(PUB, 'pdf', '세미나')
// 덱 → 세미나 슬러그 매핑(발표자료가 덱으로 존재하는 회차만 등록)
const DECKS = {
  s1: '2026-09-07-bapzzi-ot-setup-and-big-picture',
  s2: '2026-09-14-bapzzi-contribute-and-first-delegation',
  s3: '2026-09-21-bapzzi-build-sprint',
}
const CHROME = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].find(existsSync)

if (!CHROME) { console.error('Chrome 실행 파일을 찾지 못함'); process.exit(1) }

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png' }

const pairs = process.argv.slice(2).length
  ? process.argv.slice(2).map((a) => a.split('='))
  : Object.entries(DECKS)

for (const [deck] of pairs) {
  if (!existsSync(join(PUB, 'slides', deck, 'index.html'))) { console.error(`덱 없음: slides/${deck}`); process.exit(1) }
}

const server = createServer((req, res) => {
  const clean = decodeURIComponent(req.url.split('?')[0])
  let file = join(PUB, clean)
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html')
  if (!existsSync(file)) { res.writeHead(404); res.end(); return }
  res.writeHead(200, { 'content-type': MIME[extname(file)] || 'application/octet-stream' })
  res.end(readFileSync(file))
})

server.listen(0, '127.0.0.1', async () => {
  const port = server.address().port
  mkdirSync(OUT, { recursive: true })
  try {
    for (const [deck, slug] of pairs) {
      const out = join(OUT, `${slug}.pdf`)
      await run(CHROME, [
        '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
        `--user-data-dir=${join(process.env.TEMP || '/tmp', 'seminar-pdf-profile')}`,
        `--print-to-pdf=${out}`, '--no-pdf-header-footer', '--virtual-time-budget=10000',
        `http://127.0.0.1:${port}/slides/${deck}/`,
      ], { timeout: 120000 })
      console.log(`PDF written: ${out}`)
    }
  } finally {
    server.close()
  }
})
