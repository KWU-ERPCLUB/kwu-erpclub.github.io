// 공개 면 스크린샷(public/img/projects/hub/shot-*.jpg) → 프로젝트 기록 「지금의 허브」 비교 블록 소스.
// 2026-08-19 신설(오너 "캡처본이 다 옛날 버전"): 수동 캡처는 UI가 바뀔 때마다 낡는다 → 명령 1줄로 재생성한다.
// 규격 = 1440×900 CSS × 배율 2 = 2880×1800(기존 캡처와 동일). 표지 스크립트(export-seminar-cover.mjs) 선례를 따른다.
//
// 사용: npm run build  →  node scripts/export-hub-shots.mjs [키 ...]   (인자 없으면 SHOTS 전 건)
// 사전 조건: dist/ 빌드본 존재 + Chrome + Python(Pillow) — Chrome은 PNG만 쓰므로 JPEG 변환에 Pillow를 쓴다.
// 워크스페이스는 로그인 영역이라 여기서 못 찍는다 → public/img/guide/*.jpg(사용법 페이지 캡처)를 재사용한다.
import { createServer } from 'node:http'
import { readFileSync, existsSync, mkdirSync, statSync, rmSync } from 'node:fs'
import { join, extname, resolve } from 'node:path'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { tmpdir } from 'node:os'

const run = promisify(execFile)

const APP = resolve(import.meta.dirname, '..')
const DIST = join(APP, 'dist')
const OUT = join(APP, 'public', 'img', 'projects', 'hub')

// 키 → 경로. 파일명 shot-<키>.jpg
// cover = 예외(파일명 cover.jpg·16:9) — 프로젝트 목록 카드 커버. 다른 키와 규격이 달라 SIZES에서 분기한다.
const SHOTS = {
  cover: '/',
  home: '/',
  insights: '/insights/',
  seminars: '/seminars/',
  projects: '/projects/',
  adsp: '/projects/adsp/',
  recruit: '/recruit/',
}

const WIDTH = 1440
const HEIGHT = 900
const SCALE = 2
const QUALITY = 82

// 키별 예외 규격 — 목록 카드 커버만 16:9(카드가 16/9로 잘라 쓰므로 촬영부터 맞춘다).
const SIZES = { cover: [1600, 900] }
const fileName = (key) => (key === 'cover' ? 'cover.jpg' : `shot-${key}.jpg`)

const CHROME = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].find(existsSync)

if (!CHROME) { console.error('Chrome 실행 파일을 찾지 못함'); process.exit(1) }
if (!existsSync(DIST)) { console.error('dist/ 없음 — 먼저 npm run build'); process.exit(1) }

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webmanifest': 'application/manifest+json',
  '.xml': 'application/xml', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.pdf': 'application/pdf',
}

const keys = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(SHOTS)
for (const k of keys) if (!SHOTS[k]) { console.error(`알 수 없는 키: ${k} (가능: ${Object.keys(SHOTS).join(', ')})`); process.exit(1) }

const server = createServer((req, res) => {
  const clean = decodeURIComponent(req.url.split('?')[0])
  let file = join(DIST, clean)
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html')
  if (!existsSync(file)) { res.writeHead(404); res.end(); return }
  res.writeHead(200, { 'content-type': MIME[extname(file)] || 'application/octet-stream' })
  res.end(readFileSync(file))
})

server.listen(0, '127.0.0.1', async () => {
  const port = server.address().port
  const tmp = join(tmpdir(), 'hub-shots')
  mkdirSync(OUT, { recursive: true })
  mkdirSync(tmp, { recursive: true })
  try {
    for (const key of keys) {
      const png = join(tmp, `${key}.png`)
      const [w, h] = SIZES[key] || [WIDTH, HEIGHT]
      await run(CHROME, [
        '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--hide-scrollbars',
        `--user-data-dir=${join(tmp, 'profile')}`,
        // 배율은 명시 고정 — 시스템 배율(이 PC 165%)이 새면 캡처 크기가 어긋난다.
        `--force-device-scale-factor=${SCALE}`, `--window-size=${w},${h}`,
        // 진입 모션·CountUp이 끝난 뒤를 찍는다.
        '--virtual-time-budget=8000',
        `--screenshot=${png}`, `http://127.0.0.1:${port}${SHOTS[key]}`,
      ], { timeout: 120000 })
      if (!existsSync(png)) throw new Error(`캡처 실패: ${key}`)

      const jpg = join(OUT, fileName(key))
      await run('python', ['-c', [
        'import sys',
        'from PIL import Image',
        'im = Image.open(sys.argv[1]).convert("RGB")',
        `im.save(sys.argv[2], "JPEG", quality=${QUALITY}, optimize=True)`,
      ].join('\n'), png, jpg], { timeout: 60000 })
      console.log(`shot: ${jpg}`)
    }
  } finally {
    server.close()
    rmSync(tmp, { recursive: true, force: true })
  }
})
