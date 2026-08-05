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

// ── P4: 공개면 테스트가 네트워크 없이 GREEN ──
test('P4 — 공개 페이지 컴포넌트는 데이터 계층에 의존하지 않음(정적 콘텐츠 유지)', () => {
  const workspaceDir = path.join(SRC_DIR, 'workspace')
  const offenders = srcFiles
    .filter((f) => !f.startsWith(DATA_DIR) && !f.startsWith(workspaceDir))
    .filter((f) => !f.includes('workspace-entry'))
    .filter((f) => /from\s+['"][^'"]*data\/index\.js['"]/.test(read(f)))
  expect(offenders).toEqual([])
})

test('P4 — 목 저장소·supabase 모듈 어디에도 삭제 연산(delete·truncate·drop) 없음', () => {
  for (const f of walk(DATA_DIR)) {
    if (f.endsWith('.test.js')) continue
    const body = read(f).toLowerCase()
    for (const op of ['truncate', 'drop table', '.delete(']) expect(body).not.toContain(op)
  }
})

// ── env 키는 참조만(실값 하드코딩 금지) ──
test('env 키는 참조만 — 소스에 supabase.co 실주소 하드코딩 0건', () => {
  const offenders = srcFiles
    .filter((f) => !f.endsWith('.test.js') && !f.endsWith('.test.jsx'))
    .filter((f) => /https:\/\/[a-z0-9-]+\.supabase\.co/.test(read(f)))
  expect(offenders).toEqual([])
})
