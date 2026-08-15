// 세미나 목록 v5 (2026-08-15 오너 개편) — 구 [피처 밴드 + 3열 카드 그리드] 폐지.
// 지적 5건: ①피처 썸네일이 나머지와 크기 차이가 없다 ②그 밴드만 블랙이라 톤이 어긋난다
// ③회색 배경 쓰지 마라 ④인사이트처럼 모아둔 꼴 말고 타임라인이 드러나게, 내리면 인터랙티브하게
// ⑤썸네일·제목 키우고 텍스트는 줄여라 + 필터 제거.
//
// 구조 = 세로 스파인(스크롤 진행 채움) + 회차 노드 + 큰 썸네일 카드.
//   맨 위 1건(최신·다음) = lead 행 = 썸네일 전폭·제목 최대 / 나머지 = 썸네일 좌측 고정폭.
// 면 = 흰색만(블랙·회색 면 0). 강조 = 버건디 선·점(화이트리스트 범위).
// 텍스트 = 회차·날짜·유형 + 제목까지. 발췌·요점 나열은 상세로 내렸다.
import { sortSeminars, isUpcoming, publicOnly } from './seminars-logic.js'
import { splitTitle } from './insights-logic.js'
import { useTimelineFlow, useRowReveal } from './seminars-motion.js'
import { PageHead } from '../shared.jsx'

function whenLabel(s) {
  return s['일정미정'] === true ? '일정 미정' : (s.date || '').replace(/-/g, '.')
}

// 한 행 = 노드 + 카드. lead = 맨 위 1건(크게). export = 픽스처 주입 테스트용.
export function SeminarRow({ s, today, onOpen = () => {}, lead = false, active = false, index = 0 }) {
  const upcoming = isUpcoming(s, today)
  const thumbs = Array.isArray(s['썸네일']) ? s['썸네일'].filter(Boolean) : []
  const cls = ['sem-tl-row', lead ? 'is-lead' : '', active ? 'is-active' : ''].filter(Boolean).join(' ')
  return (
    <li className={cls} data-row={index}>
      <span className="sem-tl-node" aria-hidden="true">
        <i className="sem-tl-dot" />
        {/* 특강(2026-08-15) = 정규 차시 밖 — 번호 대신 '특강' 라벨(글자라 축소 클래스) */}
        <b className={s['특강'] === true ? 'sem-tl-ep is-sp' : 'sem-tl-ep'}>{s['특강'] === true ? '특강' : s.회차}</b>
      </span>
      <button type="button" className="sem-tl-card" onClick={() => onOpen(s.slug)}>
        {thumbs.length > 0 && (
          <span className="sem-tl-shot"><img src={thumbs[0]} alt="" loading="lazy" /></span>
        )}
        <span className="sem-tl-txt">
          <span className="sem-tl-meta">
            <span className="sem-tl-when">{whenLabel(s)}</span>
            <span className="sem-tl-kind">{s.유형}</span>
            {upcoming && <span className="sem-soon-badge">예정</span>}
          </span>
          <span className="sem-tl-h">
            {splitTitle(s.title).map((line, i) => (
              <span className={i ? 'sem-tl-h-sub' : 'sem-tl-h-main'} key={line}>{line}</span>
            ))}
          </span>
        </span>
      </button>
    </li>
  )
}

// 맨 위 강조 대상 = 오늘 이후 중 가장 가까운 것 > 일정미정 > 최신. 순수 함수(기존 계약 유지).
export function pickFeature(items, today) {
  const dated = items.filter((s) => s['일정미정'] !== true && (s.date || '') > (today || ''))
  if (dated.length > 0) return dated.reduce((a, b) => ((a.date || '') <= (b.date || '') ? a : b))
  const tbd = items.find((s) => s['일정미정'] === true)
  if (tbd) return tbd
  return items.reduce((a, b) => ((a.date || '') >= (b.date || '') ? a : b))
}

// 타임라인 — items(이미 정렬·공개 필터됨). 0건 = 디자인된 1줄 빈 상태.
export function SeminarTimeline({ items, today, onOpen = () => {} }) {
  const list = items || []
  const { ref, fill, active } = useTimelineFlow(list.length)
  useRowReveal('.sem-tl-row', [list.length])
  if (list.length === 0) {
    return <p className="sem-tl-empty">세미나 기록 아직 없음.</p>
  }
  const first = pickFeature(list, today)
  const ordered = [first, ...list.filter((s) => s !== first)]
  return (
    <div className="sem-tl-wrap">
      <ol className="sem-tl" ref={ref}>
        <span className="sem-tl-spine" aria-hidden="true">
          <i className="sem-tl-fill" style={{ transform: `scaleY(${fill})` }} />
        </span>
        {ordered.map((s, i) => (
          <SeminarRow
            key={s.slug} s={s} today={today} onOpen={onOpen}
            lead={i === 0} active={i === active} index={i}
          />
        ))}
      </ol>
    </div>
  )
}

// 목록 뷰 컨테이너 — PageHead(설명 줄·필터 바 폐지 2026-08-15) + 타임라인. 정렬 = 최신순 고정.
export default function SeminarsTimeline({ all, today, onOpen }) {
  const items = sortSeminars(publicOnly(all), 'newest')
  return (
    <>
      <PageHead label="SEMINARS" title="세미나" />
      <SeminarTimeline items={items} today={today} onOpen={onOpen} />
    </>
  )
}
