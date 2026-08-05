// 시리즈 고정 커버 v3 — **컴포넌트형**(인라인 SVG, 외부 파일·폰트 의존 0).
// 왜 컴포넌트인가: 커버에 회차(주차) 텍스트가 들어가므로 정적 svg 1장으로는 회차 구분이 불가능하다.
//   → 시각 아이덴티티(색·타이포·구도)는 전 회차 **고정**, 바뀌는 것은 주차 텍스트 1줄뿐.
//
// 오너 판정(2026-08-05, v2 마스트헤드 반려): "과한 디자인보다는 '7월 5주차 주간 AI 트렌드' 딱 이 정도만,
//   너무 딱딱하지 않고, 썸네일이 꽉 차게."
//   ⇒ ① 정보 = [주차] + [코너명] 두 줄뿐(킥커·헤어라인·발행 밴드·부제·브랜드 마이크로 전부 삭제)
//     ② 꽉 차게 = 여백 구도 폐지, 색 면이 프레임 전체 + 타이포가 폭의 ≈85%를 먹는다(카드 축소에서도 읽힘)
//     ③ 딱딱하지 않게 = 직선 룰·제호 문법 제거, 부드러운 그레이디언트 + 유기적 원형 면(장식은 여기까지)
// 색 = 디자인규칙 §1 파생 성격색 '트렌드'(#E5F0FB/#38618C) 계열 저채도 + 본문 차콜 #141414.
//   버건디 면(fill) 금지 준수 — 버건디는 아예 쓰지 않는다.

import { seriesById } from '../content/series.js'

// 제목에서 주차 파싱 — "주간 AI 트렌드 — 7월 5주", "… 7월 4주 보강" → "7월 5주차" / "7월 4주차".
// 못 찾으면 null(= 커버에 코너명만 렌더). 커버는 회차 표기 실패로 깨지지 않는다.
export function parseWeekLabel(title) {
  const m = /(\d{1,2})\s*월\s*(\d{1,2})\s*주/.exec(String(title || ''))
  if (!m) return null
  const month = Number(m[1])
  const week = Number(m[2])
  if (!(month >= 1 && month <= 12) || !(week >= 1 && week <= 6)) return null
  return `${month}월 ${week}주차`
}

// 코너명 2줄 분할 — 큰 타이포로 프레임을 채우기 위한 고정 분할(레지스트리 표시명 기준).
// 공백 2개 이상이면 앞 2어절 / 나머지, 아니면 1줄.
export function coverLines(name) {
  const w = String(name || '').trim().split(/\s+/).filter(Boolean)
  if (w.length <= 1) return w
  if (w.length === 2) return w
  return [w.slice(0, 2).join(' '), w.slice(2).join(' ')]
}

// 주간 AI 트렌드 커버 — 좌정렬 대형 타이포 + 부드러운 블루 그레이디언트 면.
function WeeklyCover({ label, name, className }) {
  const lines = coverLines(name)
  const two = lines.length > 1
  // 주차 줄이 있으면 [주차 → 코너명 2줄], 없으면 코너명만 세로 중앙.
  const y0 = label ? 186 : 0
  const nameY = label ? [452, 680] : [380, 608]
  const alt = label ? `${label} ${name}` : name
  return (
    <svg className={className} viewBox="0 0 1200 750" role="img" aria-label={alt} preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="sc-w-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#EFF6FD" />
          <stop offset="0.5" stopColor="#DCEAF8" />
          <stop offset="1" stopColor="#BED6EE" />
        </linearGradient>
        <radialGradient id="sc-w-blob" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.85" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="sc-w-blob2" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#9FC2E4" stopOpacity="0.5" />
          <stop offset="1" stopColor="#9FC2E4" stopOpacity="0" />
        </radialGradient>
        <style>{'.sc-t{font-family:Paperlogy,"Pretendard Variable",Pretendard,"Malgun Gothic","Apple SD Gothic Neo",sans-serif}'}</style>
      </defs>

      {/* 면이 프레임 전체를 채운다(여백 구도 폐지) */}
      <rect width="1200" height="750" fill="url(#sc-w-bg)" />
      {/* 유기적 원형 면 2개 — 장식은 여기까지(윤곽선·격자 없음) */}
      <circle cx="1010" cy="150" r="430" fill="url(#sc-w-blob)" />
      <circle cx="1120" cy="700" r="380" fill="url(#sc-w-blob2)" />

      {label && (
        <text className="sc-t" x="66" y={y0} fill="#38618C" fontSize="118" fontWeight="700" letterSpacing="-3">{label}</text>
      )}
      <text className="sc-t" x="66" y={nameY[0]} fill="#141414" fontSize="222" fontWeight="800" letterSpacing="-9">{lines[0]}</text>
      {two && (
        <text className="sc-t" x="66" y={nameY[1]} fill="#141414" fontSize="222" fontWeight="800" letterSpacing="-9">{lines[1]}</text>
      )}
    </svg>
  )
}

// 컴포넌트형 커버 레지스트리 — series.js의 `커버컴포넌트` id → 그리는 함수.
// 새 시리즈가 컴포넌트 커버를 쓰려면 여기에 1줄 추가한다(id 미등록 = 아무것도 그리지 않음).
const COVERS = { weekly: WeeklyCover }

// 목록 썸네일·상세 히어로 공용 진입점. id = 시리즈 커버 컴포넌트 id, a = 기사(제목에서 주차 파싱).
export default function SeriesCover({ id, a, className = 'art-cover-svg' }) {
  const Draw = COVERS[id]
  if (!Draw) return null
  const s = seriesById(id)
  const name = (s && s.표시명) || ''
  return <Draw label={parseWeekLabel(a && a.title)} name={name} className={className} />
}
