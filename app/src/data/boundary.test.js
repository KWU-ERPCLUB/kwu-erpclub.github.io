// 경계 강제 테스트 — SPEC §6 판정 P1·P2·P4를 정적 검사로 고정한다.
// 여기가 깨지면 데이터 계층 격리가 무너진 것(리팩터로 우회하지 말 것).
import { expect, test } from 'vitest'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const DATA_DIR = path.dirname(fileURLToPath(import.meta.url))
const SRC_DIR = path.dirname(DATA_DIR)
const REPO_ROOT = path.resolve(SRC_DIR, '../..')
const SKIP_DIRS = new Set(['node_modules', 'dist', '.git', '.vite', 'public'])

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue
    const full = path.join(dir, name)
    if (statSync(full).isDirectory()) walk(full, out)
    else out.push(full)
  }
  return out
}

const srcFiles = walk(SRC_DIR).filter((f) => /\.(js|jsx)$/.test(f))
const read = (f) => readFileSync(f, 'utf8')

// ── P1: 컴포넌트에서 supabase 클라이언트 직접 import = 0건 ──
test('P1 — data/ 밖의 어떤 파일도 supabase.js·repositories.js를 직접 import 하지 않음', () => {
  const offenders = srcFiles
    .filter((f) => !f.startsWith(DATA_DIR))
    .filter((f) => /from\s+['"][^'"]*data\/(supabase|repositories|mock)\.js['"]/.test(read(f)))
    .filter((f) => !f.endsWith('.test.js') && !f.endsWith('.test.jsx'))
  expect(offenders).toEqual([])
})

test('P1 — 화면 코드에 네트워크 호출(fetch·XMLHttpRequest) 없음(저장소 계층만 통신)', () => {
  const offenders = srcFiles
    .filter((f) => f !== path.join(DATA_DIR, 'supabase.js'))
    .filter((f) => !f.endsWith('.test.js') && !f.endsWith('.test.jsx'))
    .filter((f) => /\bfetch\s*\(|XMLHttpRequest/.test(read(f)))
  expect(offenders).toEqual([])
})

// ── P2: service key 문자열이 repo 내 = 0건 ──
// 검사 대상 = 실제 키 물질(JWT·secret 접두어)과 "값이 채워진" service 키 할당.
// 산문에서 키 이름을 언급하는 것(문서·주석)은 위반이 아니다 — 값이 있으면 위반.
test('P2 — service key·JWT 실값 문자열 0건(repo 전역)', () => {
  const patterns = [
    new RegExp('eyJ' + 'hbGciOi'),                    // Supabase JWT 실값 접두어
    new RegExp('sb' + '_secret_'),                    // 신형 secret key 접두어
    new RegExp('SERVICE' + '_ROLE[_A-Z]*\\s*[:=]\\s*["\']?\\S+'), // 값이 채워진 할당
  ]
  const hits = []
  for (const file of walk(REPO_ROOT)) {
    if (!/\.(js|jsx|json|sql|md|ya?ml|html|txt|example)$/.test(file)) continue
    if (file.endsWith('package-lock.json')) continue
    if (file === fileURLToPath(import.meta.url)) continue
    const body = read(file)
    for (const p of patterns) if (p.test(body)) hits.push(`${path.relative(REPO_ROOT, file)}:${p.source}`)
  }
  expect(hits).toEqual([])
})

// ── P4: 공개면이 데이터 계층에 닿는 지점은 1곳만(M2 — 인사이트 DB 서빙 전환) ──
// M1에서는 "공개면은 데이터 계층 무의존"이었으나, M2에서 인사이트가 DB 서빙으로 바뀌었다.
// 규칙을 없애는 대신 좁힌다: 어댑터 1개(pages/insights-source.js)만 허용 — 컴포넌트 산개 금지.
// M3에서 규칙을 한 단계 더 좁힌다: "어떤 data/* 모듈을" 쓰는지까지 화이트리스트로 고정.
//   insights-source.js → data/index.js  (인사이트 DB 서빙 어댑터)
//   shared.jsx         → data/session-flag.js (공개 헤더의 로그인 표시 — localStorage 동기 확인만)
//   pages/apply-source.js → data/index.js  (/recruit 신청 폼 어댑터 — 2026-08-05 오너 보류 해제)
const DATA_CONSUMERS = {
  'pages/insights-source.js': ['index'],
  'pages/apply-source.js': ['index'],
  'shared.jsx': ['session-flag'],
}
// 백엔드와 무관한 정적 상수 모듈(모집 창·FAQ 원천 — faq는 E4 공용화 2026-08-05) — 경계 규칙의 대상이 아니다.
// (log.js는 워크스페이스 공지 탭 전용으로 내부화 — 공개면 소비 금지, IA 4차 2026-08-05)
const STATIC_DATA = ['recruit', 'faq']
test('P4 — 공개 페이지가 쓰는 data/ 모듈 = 화이트리스트 3쌍뿐', () => {
  const workspaceDir = path.join(SRC_DIR, 'workspace')
  const offenders = []
  for (const file of srcFiles) {
    if (file.startsWith(DATA_DIR) || file.startsWith(workspaceDir)) continue
    if (file.includes('workspace-entry')) continue
    if (/\.test\.(js|jsx)$/.test(file)) continue
    const rel = path.relative(SRC_DIR, file).replace(/\\/g, '/')
    const allowed = [...STATIC_DATA, ...(DATA_CONSUMERS[rel] || [])]
    for (const m of read(file).matchAll(/from\s+['"][^'"]*data\/([a-z-]+)\.js['"]/g)) {
      if (!allowed.includes(m[1])) offenders.push(`${rel} → data/${m[1]}.js`)
    }
  }
  expect(offenders).toEqual([])
})

// 공개 헤더의 세션 판정은 저장소 읽기 1회뿐 — 토큰 해석·복호화·네트워크가 끼면 공개면 성능 규칙 위반.
test('P4 — session-flag는 localStorage 동기 확인만(네트워크·JSON 파싱 없음)', () => {
  const body = read(path.join(DATA_DIR, 'session-flag.js'))
  expect(body).toContain('getItem')
  for (const bad of ['fetch(', 'JSON.parse', 'await ']) expect(body).not.toContain(bad)
})

// 삭제 연산 = 화이트리스트 3테이블에서만(상호작용 취소·스크랩 삭제). 스키마 파괴 연산은 여전히 0건.
test('P4 — 데이터 계층에 truncate·drop 0건, 행 삭제는 화이트리스트 테이블만', () => {
  for (const f of walk(DATA_DIR)) {
    if (f.endsWith('.test.js')) continue
    const body = read(f).toLowerCase()
    for (const op of ['truncate', 'drop table', 'drop column']) expect(body).not.toContain(op)
  }
  const supa = read(path.join(DATA_DIR, 'supabase.js'))
  expect(supa).toContain('DELETABLE')
  for (const t of ['article_likes', 'article_bookmarks', 'collections']) expect(supa).toContain(t)
  // 기사·멤버 등 콘텐츠 테이블은 삭제 대상이 아니다(md·DB 원천 보호)
  expect(/DELETABLE\s*=\s*new Set\(\[[^\]]*'articles'/.test(supa)).toBe(false)
})

// ── env 키는 참조만(실값 하드코딩 금지) ──
test('env 키는 참조만 — 소스에 supabase.co 실주소 하드코딩 0건', () => {
  const offenders = srcFiles
    .filter((f) => !f.endsWith('.test.js') && !f.endsWith('.test.jsx'))
    .filter((f) => /https:\/\/[a-z0-9-]+\.supabase\.co/.test(read(f)))
  expect(offenders).toEqual([])
})
