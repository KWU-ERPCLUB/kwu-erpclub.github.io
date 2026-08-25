// 썸네일 4계층 ④ — 자동 타이포 커버(인라인 SVG, 외부 의존 0). 성격색 배경 + 주제 라벨 + 제목 2줄.
// 이미지·로고·스톡이 전부 없을 때만 그린다(thumb-resolver kind='cover').
// 비율 = 16:10 고정(다른 계층과 같은 프레임 — .art-cover가 크롭·보더를 통일).
import { natureKey, splitTitle } from './insights-logic.js'

// 성격 2색(§1 파생 — articles.css .chip-* 와 같은 값). SVG는 CSS 변수를 못 받으므로 여기서 상수 보유.
const NATURE_COLOR = {
  news: ['#e5f0fb', '#38618c'],
  analysis: ['#faf0e1', '#6f5227'], /* AA 6.39:1 — articles.css .chip-analysis와 동일 값 */
}

// 한글 1 / 영숫자 0.55 로 폭을 어림해 줄을 끊는다(SVG는 자동 줄바꿈이 없다).
function weigh(s) {
  let w = 0
  for (const ch of s) w += /[\x20-\x7E]/.test(ch) ? 0.55 : 1
  return w
}

// 제목 → 최대 2줄(넘치면 마지막 줄 말줄임). budget = 줄당 폭(한글 글자 수 기준).
export function wrapTitle(title, budget = 13, lines = 2) {
  const words = String(title || '').trim().split(/\s+/).filter(Boolean)
  const all = []
  let cur = ''
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w
    if (weigh(next) <= budget || !cur) { cur = next; continue }
    all.push(cur)
    cur = w
  }
  if (cur) all.push(cur)
  if (all.length === 0) return ['']
  const out = all.slice(0, lines)
  const last = out.length - 1
  if (all.length > lines || weigh(out[last]) > budget) {
    let t = out[last]
    while (t.length > 1 && weigh(`${t}…`) > budget) t = t.slice(0, -1)
    out[last] = `${t}…`
  }
  return out
}

// 한 줄을 budget에 맞춰 말줄임(넘칠 때만).
function fitLine(s, budget) {
  if (weigh(s) <= budget) return s
  let t = s
  while (t.length > 1 && weigh(`${t}…`) > budget) t = t.slice(0, -1)
  return `${t}…`
}

// 커버 제목 줄 — 대시로 나뉜 제목은 절이 곧 줄이다(오너 2026-08-15: 커버에도 대시 미표기).
// 절이 하나면 기존 폭 기준 자동 줄바꿈(wrapTitle) 그대로.
export function coverLines(title, budget = 13, lines = 2) {
  const segs = splitTitle(title)
  if (segs.length < 2) return wrapTitle(title, budget, lines)
  return segs.slice(0, lines).map((s) => fitLine(s, budget))
}

export function InsightCover({ a }) {
  const nk = natureKey(a && a['성격'])
  const [bg, fg] = NATURE_COLOR[nk] || NATURE_COLOR.analysis
  const lines = coverLines(a && a.title)
  const label = (a && a['주제']) || (a && a['성격']) || 'AI INSIGHTS'
  return (
    <svg className="art-cover-svg" viewBox="0 0 320 200" role="img" aria-label={[label, ...splitTitle(a && a.title)].join('. ')} preserveAspectRatio="xMidYMid slice">
      <rect width="320" height="200" fill={bg} />
      {/* 헤어라인 격자(Tars 문법 승계) — 장식 최소, 면 채움 없음 */}
      <g stroke={fg} strokeOpacity="0.16" strokeWidth="1">
        <line x1="0" y1="52" x2="320" y2="52" />
        <line x1="0" y1="148" x2="320" y2="148" />
        <line x1="232" y1="0" x2="232" y2="200" />
      </g>
      <text x="24" y="36" fill={fg} fontSize="11" fontWeight="700" letterSpacing="1.4" opacity="0.85">{label}</text>
      {lines.map((ln, i) => (
        <text key={i} x="24" y={92 + i * 30} fill={fg} fontSize="22" fontWeight="800" letterSpacing="-0.4">{ln}</text>
      ))}
      <rect x="24" y="168" width="28" height="3" fill={fg} />
    </svg>
  )
}

export default InsightCover
