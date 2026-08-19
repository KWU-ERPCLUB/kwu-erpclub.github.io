// 헤드리스 Chrome 캡처 스크립트 4종(export-deck-pdf·export-hub-shots·export-seminar-cover·export-app-icon)의 공용부.
// 2026-08-20 신설: 같은 Chrome 경로 탐색 배열과 같은 정적 서버가 파일마다 복붙돼 있었다 — 여기 1곳으로 모은다.
// 캡처 규격(크기·배율·virtual-time)은 스크립트마다 다르므로 여기서 통일하지 않는다.
import { createServer } from 'node:http'
import { readFileSync, existsSync, statSync } from 'node:fs'
import { join, extname } from 'node:path'

// Chrome 실행 파일 — 설치 위치 후보(윈도우 2종·macOS 1종) 중 실재하는 첫 경로.
export const CHROME_CANDIDATES = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
]

export const findChrome = () => CHROME_CANDIDATES.find(existsSync) || null

// 못 찾으면 같은 문구로 즉시 종료(호출 측 분기 중복 제거).
export function requireChrome() {
  const chrome = findChrome()
  if (!chrome) { console.error('Chrome 실행 파일을 찾지 못함'); process.exit(1) }
  return chrome
}

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.webmanifest': 'application/manifest+json', '.xml': 'application/xml', '.ico': 'image/x-icon',
  '.woff2': 'font/woff2', '.pdf': 'application/pdf',
}

// root 디렉터리를 그대로 서빙하는 최소 정적 서버. 디렉터리 요청 = index.html.
// 반환 = node:http Server(호출 측이 listen(0, '127.0.0.1')으로 임의 포트를 잡는다).
export function createStaticServer(root) {
  return createServer((req, res) => {
    const clean = decodeURIComponent(req.url.split('?')[0])
    let file = join(root, clean)
    if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html')
    if (!existsSync(file)) { res.writeHead(404); res.end(); return }
    res.writeHead(200, { 'content-type': MIME[extname(file)] || 'application/octet-stream' })
    res.end(readFileSync(file))
  })
}
