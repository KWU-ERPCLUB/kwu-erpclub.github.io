// 세미나(SEMINARS) 순수 로직 — v3 타임라인 아카이브(2026-07-25). 전부 순수 함수(부수효과 0)·테스트 대상.
// date 비교는 today 문자열('YYYY-MM-DD')을 인자로 받아 시계에 비의존(컴포넌트가 today 주입).
// 구 splitByDate·nextSeminar(예정/과거 이분)는 v3에서 폐지 — 목록 = 단일 시간순 타임라인. 이력은 git.
// (구 extractTopics·filterByTopic 주제 필터 + excerpt 재수출 = 2026-08-20 삭제 — 화면에서 걷힌 뒤 참조 0.
//  발췌가 다시 필요하면 insights-logic.js의 excerpt를 직접 import 한다.)

// 로컬 날짜 'YYYY-MM-DD'. Date 인자를 받아(기본 = 지금) 테스트 시 고정 시각 주입 가능.
export function todayString(d = new Date()) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// 정렬 — order='newest'(최신순·date 내림차순) | 'oldest'(과거순·오름차순). 문자열 'YYYY-MM-DD' 사전순=시간순.
export function sortSeminars(all, order = 'newest') {
  const list = [...(all || [])]
  const dir = order === 'oldest' ? 1 : -1
  list.sort((a, b) => dir * (a.date || '').localeCompare(b.date || ''))
  return list
}

// 첫 문장만 잘라낸다(오너 2026-08-15: 상세 헤더 리드가 4줄이라 핵심이 안 보인다).
// 헤더 = 첫 문장 1줄 / 나머지 = 본문으로 내려보낸다. 종결부호(.!?·다.)까지 포함해 자른다.
export function splitFirstSentence(text) {
  const t = String(text || '').trim()
  if (!t) return { first: '', rest: '' }
  const m = t.match(/^[\s\S]*?[.!?](\s|$)/)
  if (!m) return { first: t, rest: '' }
  const first = m[0].trim()
  const rest = t.slice(m[0].length).trim()
  // 첫 문장이 지나치게 짧으면(발췌 실패) 통째로 헤더에 둔다.
  if (first.length < 12) return { first: t, rest: '' }
  return { first, rest }
}

// 대외 공개분만(오너 2026-08-15) — frontmatter `공개: false` = 준비 중이라 공개 페이지에서 뺀다.
// 미기재 = 공개(기존 콘텐츠 무영향). 운영진 열람 경로 = 워크스페이스.
export function publicOnly(all) {
  return (all || []).filter((s) => s && s['공개'] !== false)
}

// date > today(엄격 미래) ∨ 일정미정=true → "예정" 배지. today == date는 예정 아님(SPEC §4 v3).
// 일정미정 = 개최일 미확정 세미나(과거 date여도 예정 취급 — 2026-07-27 오너 지시).
export function isUpcoming(s, today) {
  if (s && s['일정미정'] === true) return true
  return (s && s.date ? s.date : '') > (today || '')
}

// 본문을 `## <헤딩>`으로 분할 → { intro, sections: { 헤딩: 본문 } }. 상세(3블록)·발췌 공용 순수 함수.
export function splitSeminarBody(body) {
  const parts = (body || '').split(/^##\s+/m)
  const intro = (parts[0] || '').trim()
  const sections = {}
  for (let i = 1; i < parts.length; i++) {
    const nl = parts[i].indexOf('\n')
    const heading = (nl === -1 ? parts[i] : parts[i].slice(0, nl)).trim()
    sections[heading] = nl === -1 ? '' : parts[i].slice(nl + 1).trim()
  }
  return { intro, sections }
}

// 서문(intro)을 리드(첫 단락) + 나머지로 분할 — 상세 밴드 리드/본문 분리용.
export function splitLead(intro) {
  const t = (intro || '').trim()
  if (!t) return { lead: '', rest: '' }
  const parts = t.split(/\n\s*\n/)
  return { lead: parts[0].trim(), rest: parts.slice(1).join('\n\n').trim() }
}

// 마크다운 불릿("- ") 텍스트만 순서대로 추출 — 상세 "다루는 내용" 번호 목차형 렌더용(순수).
export function parseBullets(md) {
  return (md || '')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.startsWith('- '))
    .map((l) => l.slice(2).trim())
    .filter(Boolean)
}

// 출처 섹션 파싱 → { links: [{text, url}], note }. 링크 = 불릿 내 [text](url) 전부(등장 순), note = 불릿 아닌 말미 단락.
// 상세 "출처" 리스트(출처 행 + 소형 각주) 렌더용 순수 함수.
export function parseSources(md) {
  const links = []
  const noteLines = []
  for (const raw of (md || '').split('\n')) {
    const line = raw.trim()
    if (!line) continue
    if (line.startsWith('- ')) {
      const re = /\[([^\]]+)\]\(([^)]+)\)/g
      let m
      while ((m = re.exec(line)) !== null) links.push({ text: m[1].trim(), url: m[2].trim() })
    } else {
      noteLines.push(line)
    }
  }
  return { links, note: noteLines.join(' ').trim() }
}
