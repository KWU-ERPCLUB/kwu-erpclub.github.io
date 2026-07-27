// 세미나 v3 목록 = 타임라인 아카이브(2026-07-25 오너 — Linear changelog 변형). 상세(SeminarDetail)는 별도·불변.
// 상단 소개 → 필터 바(주제 탭 + 정렬 토글) → 세로 날짜 타임라인(좌 날짜 레일·점 × 항목). 최신 = 맨 위 크게.
// 필터·정렬 = 세션 상태만(URL 미반영 — SPEC §4 v3 허용). 콘텐츠 결합 없음 — all/today는 상위(Seminars)가 주입.
import { useMemo, useState } from 'react'
import { excerpt, splitSeminarBody, sortSeminars, extractTopics, filterByTopic, isUpcoming } from './seminars-logic.js'

// 슬라이드 썸네일 카드 — 2장이면 겹침(뒷장 오프셋·앞장 위), 1장이면 단일. 클릭=슬라이드 새 탭(없으면 비링크).
// 썸네일 0장이면 이 컴포넌트 자체를 렌더하지 않음(호출부에서 가드) — hover 리프트는 CSS(transform·opacity).
function SlideThumb({ thumbs, slide, title }) {
  const two = thumbs.length >= 2
  const inner = (
    <span className={`sem-thumb${two ? ' is-stack' : ''}`}>
      {two && <img className="sem-thumb-img sem-thumb-back" src={thumbs[1]} alt="" loading="lazy" />}
      <img className="sem-thumb-img sem-thumb-front" src={thumbs[0]} alt={`${title} 발표자료 미리보기`} loading="lazy" />
    </span>
  )
  return slide
    ? <a className="sem-thumb-link" href={slide} target="_blank" rel="noreferrer" aria-label="발표자료 열기">{inner}</a>
    : <span className="sem-thumb-link is-static">{inner}</span>
}

// 타임라인 한 항목 = 날짜 레일 + [메타 칩·예정 배지 → 제목(→상세) → 썸네일 카드 → 요점/발췌].
// featured(첫 항목=최신) = 제목 타이포 크게(Linear 변형). export = 콘텐츠 무관 단위 테스트용.
export function SeminarTimelineItem({ s, today, featured = false, onOpen = () => {} }) {
  const upcoming = isUpcoming(s, today)
  const thumbs = Array.isArray(s['썸네일']) ? s['썸네일'].filter(Boolean) : []
  const points = Array.isArray(s['요점']) ? s['요점'] : null
  return (
    <li className={`sem-tl-item${featured ? ' is-featured' : ''}`}>
      <div className="sem-tl-date">
        {s['일정미정'] === true
          ? <span className="sem-tl-day">일정 미정</span>
          : <time className="sem-tl-day" dateTime={s.date}>{(s.date || '').replace(/-/g, '.')}</time>}
        {upcoming && <span className="sem-soon-badge">예정</span>}
      </div>
      <div className="sem-tl-body">
        <span className="sem-tl-dot" aria-hidden="true" />
        <span className="hub-chips sem-tl-chips">
          <span className="hub-chip">{s.회차}회</span>
          <span className="hub-chip">{s.유형}</span>
          {s['주제'] && <span className="hub-chip">{s['주제']}</span>}
        </span>
        <button type="button" className="sem-tl-title" onClick={() => onOpen(s.slug)}>{s.title}</button>
        {featured && <span className="sem-tl-underbar" aria-hidden="true" />}
        {thumbs.length > 0 && <SlideThumb thumbs={thumbs} slide={s['슬라이드']} title={s.title} />}
        {points ? (
          <ul className="sem-tl-points">{points.map((p) => <li key={p}>{p}</li>)}</ul>
        ) : (
          <p className="sem-tl-excerpt">{excerpt(splitSeminarBody(s.body).intro || s.body, 120)}</p>
        )}
      </div>
    </li>
  )
}

// 프리젠테이션 리스트 — items(이미 정렬·필터됨)만 받아 레일+항목 렌더. 0건=디자인된 1줄 빈 상태(SPEC §4 v3).
// export = 픽스처 주입 테스트용(순수 렌더).
export function SeminarTimeline({ items, today, onOpen = () => {} }) {
  if (!items || items.length === 0) {
    return <p className="sem-tl-empty">세미나 기록 아직 없음.</p>
  }
  return (
    <ol className="sem-tl">
      {items.map((s, i) => (
        <SeminarTimelineItem key={s.slug} s={s} today={today} featured={i === 0} onOpen={onOpen} />
      ))}
    </ol>
  )
}

// 목록 뷰 컨테이너 — 소개 헤드 + 필터 바(주제 탭·정렬 토글) + 타임라인. 상태(주제·정렬) = 세션만·URL 미반영.
export default function SeminarsTimeline({ all, today, onOpen }) {
  const [topic, setTopic] = useState(null)
  const [order, setOrder] = useState('newest') // 기본 = 최신순
  const topics = useMemo(() => extractTopics(all), [all])
  const items = useMemo(() => sortSeminars(filterByTopic(all, topic), order), [all, topic, order])
  return (
    <>
      <header className="sem-head">
        <span className="sem-eyebrow">SEMINARS</span>
        <h1 className="sem-head-title">세미나</h1>
        <p className="sem-head-sub">주기 개최 세미나 아카이브 — 발표자료·기록 축적.</p>
      </header>

      <div className="sem-filter-bar">
        <div className="sem-filter" role="group" aria-label="주제 필터">
          <button type="button" className={topic === null ? 'on' : ''} aria-pressed={topic === null} onClick={() => setTopic(null)}>전체</button>
          {topics.map((t) => (
            <button key={t} type="button" className={topic === t ? 'on' : ''} aria-pressed={topic === t} onClick={() => setTopic(t)}>{t}</button>
          ))}
        </div>
        <button type="button" className="sem-sort" onClick={() => setOrder(order === 'newest' ? 'oldest' : 'newest')} aria-label="정렬 순서 전환">
          {order === 'newest' ? '최신순' : '과거순'}
        </button>
      </div>

      <SeminarTimeline items={items} today={today} onOpen={onOpen} />
    </>
  )
}
