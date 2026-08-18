// PWA 앱 아이콘(public/img/app/) 생성기 — 파비콘 아이덴티티(검정 라운드 사각 + 흰 AIM) 재현.
// 2026-08-18 신설(모바일 spec — PWA 배포): OS가 모서리를 깎으므로 아이콘은 풀블리드 정사각(투명·자체 라운드 없음).
// 텍스트는 안전영역(중앙 80%) 안 — maskable 겸용. 사용: node scripts/export-app-icon.mjs (인자 없음, 3종 전 건).
import { writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const run = promisify(execFile)

const APP = resolve(import.meta.dirname, '..')
const OUT = join(APP, 'public', 'img', 'app')

const SIZES = [
  { file: 'icon-512.png', s: 512 },
  { file: 'icon-192.png', s: 192 },
  { file: 'apple-touch-icon.png', s: 180 },
]

const CHROME = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].find(existsSync)

if (!CHROME) { console.error('Chrome 실행 파일을 찾지 못함'); process.exit(1) }

const html = (s) => `<!doctype html><meta charset="utf-8" />
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/fonts-archive/Paperlogy/Paperlogy.css" />
<style>
  html,body{margin:0}
  body{width:${s}px;height:${s}px;background:#161616;display:flex;align-items:center;justify-content:center;overflow:hidden}
  span{font:800 ${Math.round(s * 0.3)}px 'Paperlogy',system-ui,sans-serif;letter-spacing:-0.02em;color:#fff}
</style>
<span>AIM</span>`

mkdirSync(OUT, { recursive: true })
const work = join(tmpdir(), 'aim-app-icon')
mkdirSync(work, { recursive: true })

for (const { file, s } of SIZES) {
  const src = join(work, `${s}.html`)
  const out = join(OUT, file)
  writeFileSync(src, html(s), 'utf8')
  await run(CHROME, [
    '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--hide-scrollbars',
    `--user-data-dir=${join(work, 'profile')}`,
    `--window-size=${s},${s}`, '--virtual-time-budget=9000', '--force-device-scale-factor=1',
    `--screenshot=${out}`, `file:///${src.replace(/\\/g, '/')}`,
  ], { timeout: 120000 })
  console.log(`icon written: ${out}`)
}
