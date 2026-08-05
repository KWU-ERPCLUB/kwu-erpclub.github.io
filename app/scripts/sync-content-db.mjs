// md → DB 동기화 (SPEC §0-6·§4-3) — CI가 main push마다 실행한다.
// 원칙 3개:
//   ① upsert만 한다. 삭제·비우기 연산 없음 — DB에서 글을 내리는 것은 사람/운영진 몫이다.
//   ② 키 = 파일명 스템(articles.슬러그). 같은 파일을 다시 밀면 같은 행이 갱신된다(멱등).
//   ③ 키(service key)는 환경변수로만 받는다. 이 파일·repo 어디에도 값이 없다(판정 P2).
// 범위 = content/기사 only. 세미나는 M4.
//
// 사용법:
//   node scripts/sync-content-db.mjs --dry     # 네트워크 없이 파싱·대상 목록만 출력
//   SUPABASE_URL=... SUPABASE_SERVICE_KEY=... node scripts/sync-content-db.mjs
import { validateEntry } from '../src/content/schema.js'
import { toDbRow } from '../src/content/db-map.js'
import { readEntries } from './content-files.mjs'

const KIND = '기사'
const TABLE = 'articles'
const dry = process.argv.includes('--dry')

// 행 매핑 = src/content/db-map.js(단일원천 — 화면의 역매핑과 같은 파일).
// 작성자(uuid)는 건드리지 않는다 — 루틴 발행분은 멤버 계정이 없고, 워크스페이스 기고분은 이미 값이 있다.

function readConfig() {
  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim().replace(/\/+$/, '')
  const key = (process.env.SUPABASE_SERVICE_KEY || '').trim()
  const missing = [!url && 'SUPABASE_URL', !key && 'SUPABASE_SERVICE_KEY'].filter(Boolean)
  if (missing.length) {
    console.error(`환경변수 결측: ${missing.join(', ')}`)
    console.error('로컬 확인은 네트워크 없이: node scripts/sync-content-db.mjs --dry')
    console.error('CI는 repo Secrets(VITE_SUPABASE_URL·SUPABASE_SERVICE_KEY)에서 주입한다.')
    process.exit(1)
  }
  return { url, key }
}

// PostgREST upsert — on_conflict=슬러그 + Prefer: resolution=merge-duplicates.
// 페이로드에 있는 컬럼만 갱신된다(작성자 등 미포함 컬럼은 보존).
async function upsert({ url, key }, rows) {
  const conflict = encodeURIComponent('슬러그')
  const res = await fetch(`${url}/rest/v1/${TABLE}?on_conflict=${conflict}`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=representation',
    },
    body: JSON.stringify(rows),
  })
  const text = await res.text()
  if (!res.ok) throw new Error(`upsert 실패(${res.status}): ${text.slice(0, 500)}`)
  return text ? JSON.parse(text) : []
}

const entries = readEntries(KIND)
if (entries.length === 0) {
  console.log('대상 0건 — content/기사 비어 있음. 종료.')
  process.exit(0)
}

// 계약 위반은 여기서 멈춘다(DB에 깨진 행을 넣지 않는다). npm run validate와 같은 규칙.
const bad = []
for (const e of entries) {
  const errs = validateEntry(KIND, e.file, e.data, e.body)
  if (errs.length) bad.push(`${e.file}\n  - ${errs.join('\n  - ')}`)
}
if (bad.length) {
  console.error('계약 위반 — 동기화 중단(수정 후 재실행):')
  for (const b of bad) console.error(`FAIL ${b}`)
  process.exit(1)
}

const rows = entries.map(toDbRow)
console.log(`대상 ${rows.length}건 (기사, upsert 키 = 슬러그)`)
for (const r of rows) console.log(`  ${r.게재일} ${r.슬러그} — ${r.제목}`)

if (dry) {
  console.log('--dry: 네트워크 호출 없음. 여기서 종료.')
  process.exit(0)
}

const config = readConfig()
try {
  const saved = await upsert(config, rows)
  console.log(`동기화 완료 — ${saved.length || rows.length}건 upsert(삭제 0건).`)
} catch (e) {
  console.error(e.message)
  process.exit(1)
}
