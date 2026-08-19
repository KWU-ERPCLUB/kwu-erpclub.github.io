// 세미나 슬라이드 덱(public/slides/<덱>/) → 인쇄판 PDF(public/pdf/세미나/<슬러그>.pdf).
// 2026-08-14 개정: 세미나 PDF 원천 = 상세 페이지 줄글 인쇄(export-seminar-pdf.mjs)에서 발표자료 덱 인쇄로 교체
// (오너 지시 — "PPT같이 구성하고 캡처 적극 활용"). 덱 @media print가 슬라이드당 1페이지(1280×720)를 보장한다.
// 사용: node scripts/export-deck-pdf.mjs [덱 ...] (인자 없으면 DECKS 전 건). 빌드 불필요 — public/을 직접 서빙.
//   덱만 주면 DECKS에서 슬러그를 찾고, `덱=슬러그` 형식도 그대로 받는다(하위호환).
import { existsSync, mkdirSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { requireChrome, createStaticServer } from './chrome.mjs'

const run = promisify(execFile)

const APP = resolve(import.meta.dirname, '..')
const PUB = join(APP, 'public')
const OUT = join(PUB, 'pdf', '세미나')
// 덱 → 세미나 슬러그 매핑(발표자료가 덱으로 존재하는 회차만 등록)
const DECKS = {
  sp1: '2026-07-25-bapzzi-question-to-delegation',
  s1: '2026-09-07-bapzzi-ot-setup-and-big-picture',
  s2: '2026-09-14-bapzzi-contribute-and-first-delegation',
  s3: '2026-09-21-bapzzi-build-sprint',
}
const CHROME = requireChrome()

// 인자 해석 — `덱` 단독이면 DECKS에서 슬러그를 찾고, `덱=슬러그`면 준 값을 쓴다.
// 슬러그를 못 찾으면 여기서 멈춘다(구 동작: 슬러그가 undefined인 채로 "undefined.pdf"를 써 버렸다).
const pairs = process.argv.slice(2).length
  ? process.argv.slice(2).map((a) => {
    const [deck, slug] = a.split('=')
    const resolved = slug || DECKS[deck]
    if (!resolved) {
      console.error(`덱 슬러그 미등록: ${deck} (등록된 덱: ${Object.keys(DECKS).join(', ')} / 또는 '덱=슬러그'로 지정)`)
      process.exit(1)
    }
    return [deck, resolved]
  })
  : Object.entries(DECKS)

for (const [deck] of pairs) {
  if (!existsSync(join(PUB, 'slides', deck, 'index.html'))) { console.error(`덱 없음: slides/${deck}`); process.exit(1) }
}

const server = createStaticServer(PUB)

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
