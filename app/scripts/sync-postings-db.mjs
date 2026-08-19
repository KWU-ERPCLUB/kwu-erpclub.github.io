// 공고 JSON → DB 동기화(2026-08-18) — 인사이트 md→DB(sync-content-db.mjs)와 동형. CI가 main push마다 실행.
// 원천 = ../supabase/postings.json(주간 루틴이 리서치 후 갱신·push). 원칙 3개 동일:
//   ① upsert만 한다(on_conflict=키). 삭제 없음 — 내리는 것은 운영 탭에서 사람이.
//   ② 키 = 행의 "키"(불변). 같은 키를 다시 밀면 같은 행이 갱신된다(멱등). 수기 등록 행(키 null)은 안 건드린다.
//   ③ service 키는 환경변수로만(P2). 사전 조건 = migration 0014~0016 적용.
// 사용법: node scripts/sync-postings-db.mjs --dry  /  SUPABASE_URL=... SUPABASE_SERVICE_KEY=... node scripts/sync-postings-db.mjs
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { POSTING_KINDS } from '../src/workspace/postings-logic.js'
import { taxonomyOptions } from '../src/workspace/postings-taxonomy.js'

const dry = process.argv.includes('--dry')
const SRC = fileURLToPath(new URL('../../supabase/postings.json', import.meta.url))
// 'AIM' = 세부 구분이 필요 없는 AIM 일정(2026-08-19 캘린더 색 개편 — DB 정합 = migration 0020)
const EVENT_KINDS = ['일정', '세미나', '모집', '마감', '학사', 'AIM']
const DATE = /^\d{4}-\d{2}-\d{2}$/

const data = JSON.parse(readFileSync(SRC, 'utf-8'))
const postings = data.postings || []
const events = data.events || []

// 계약 검증 — 깨진 행을 DB에 넣지 않는다(validate-content와 같은 태도).
const errs = []
const seen = new Set()
for (const [i, r] of postings.entries()) {
  const at = `postings[${i}] ${r['키'] || '(키 없음)'}`
  if (!r['키'] || seen.has(r['키'])) errs.push(`${at}: 키 필수·중복 금지`)
  seen.add(r['키'])
  if (!r['제목']) errs.push(`${at}: 제목 필수`)
  if (!POSTING_KINDS.includes(r['종류'])) errs.push(`${at}: 종류는 ${POSTING_KINDS.join('·')}`)
  if (r['분류'] && !taxonomyOptions(r['종류']).includes(r['분류'])) errs.push(`${at}: 분류 '${r['분류']}' = 레지스트리 밖`)
  if (!/^https?:\/\/\S+$/.test(r.url || '')) errs.push(`${at}: url = http(s) 필수`)
  // 코멘트 = 선택(2026-08-19 오너 — 보드가 "선별 + 한 줄 이유"에서 "링크 모음판"으로 바뀌었다).
  // url이 곧 이 행의 값어치라 url 검증만 남긴다. 출처는 있으면 화면 배지로 쓴다(자유 문자열).
  for (const k of ['접수시작', '접수마감', '시험일']) {
    if (r[k] != null && !DATE.test(r[k])) errs.push(`${at}: ${k} = YYYY-MM-DD ∨ null`)
  }
}
for (const [i, r] of events.entries()) {
  const at = `events[${i}] ${r['키'] || '(키 없음)'}`
  if (!r['키'] || seen.has(r['키'])) errs.push(`${at}: 키 필수·중복 금지`)
  seen.add(r['키'])
  if (!r['제목']) errs.push(`${at}: 제목 필수`)
  if (!DATE.test(r['날짜'] || '')) errs.push(`${at}: 날짜 = YYYY-MM-DD`)
  if (!EVENT_KINDS.includes(r['종류'])) errs.push(`${at}: 종류는 ${EVENT_KINDS.join('·')}`)
}
if (errs.length) {
  console.error('계약 위반 — 동기화 중단:')
  for (const e of errs) console.error(`FAIL ${e}`)
  process.exit(1)
}

console.log(`대상 공고 ${postings.length}건 + 학사·일정 ${events.length}건 (upsert 키 = 키)`)
if (dry) {
  for (const r of postings) console.log(`  [공고] ${r['키']} — ${r['제목']}`)
  for (const r of events) console.log(`  [일정] ${r['키']} — ${r['날짜']} ${r['제목']}`)
  console.log('--dry: 네트워크 호출 없음. 여기서 종료.')
  process.exit(0)
}

const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim().replace(/\/+$/, '')
const key = (process.env.SUPABASE_SERVICE_KEY || '').trim()
if (!url || !key) {
  console.error('환경변수 결측: SUPABASE_URL·SUPABASE_SERVICE_KEY (로컬 확인 = --dry)')
  process.exit(1)
}

async function upsert(table, rows) {
  if (rows.length === 0) return 0
  const res = await fetch(`${url}/rest/v1/${table}?on_conflict=${encodeURIComponent('키')}`, {
    method: 'POST',
    headers: {
      apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=representation',
    },
    body: JSON.stringify(rows),
  })
  const text = await res.text()
  if (!res.ok) throw new Error(`${table} upsert 실패(${res.status}) — 0014~0016 적용 확인: ${text.slice(0, 400)}`)
  return JSON.parse(text).length
}

try {
  const a = await upsert('postings', postings)
  const b = await upsert('events', events)
  console.log(`동기화 완료 — 공고 ${a}건 + 일정 ${b}건 upsert(삭제 0건).`)
} catch (e) {
  console.error(e.message)
  process.exit(1)
}
