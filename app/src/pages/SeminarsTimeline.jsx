// 세미나 목록 v3.1 (2026-08-05 §6-2a NEXTERS 실측 문법) — B2 좌 고정 라벨 컬럼(버건디 ■ + SEMINARS/ARCHIVE) ×
// 우 콘텐츠 2단 골격 + B1 다음 예정 회차(is-next) = 블랙 대면적 밴드(흰 대형 회차·날짜 숫자, 구 버건디 면 철회) +
// B3 대형 워드 스택(리스트 호버 시 비활성 감쇠 — opacity만, CSS 담당).
// 상세(SeminarDetail)는 별도·불변. 필터·정렬 = 세션 상태만(URL 미반영 — SPEC §4 v3 허용). all/today는 상위(Seminars)가 주입.
import { useMemo, useState } from 'react'
import { excerpt, splitSeminarBody, sortSeminars, extractTopics, filterByTopic, isUpcoming } from './seminars-logic.js'
import { PageHead, latestUpdated } from '../shared.jsx'

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

// 항목 공용 조각 — 메타 칩(회차·유형·주제) / 설명(요점 불릿 ∨ 본문 발췌). 일반 레일·블랙 밴드 양쪽에서 재사용.
function Chips({ s }) {
  return (
    <span className="hub-chips sem-tl-chips">
      <span className="hub-chip">{s.회차}회</span>
      <span className="hub-chip">{s.유형}</span>
      {s['주제'] && <span className="hub-chip">{s['주제']}</span>}
    </span>
  )
}

function Desc({ s }) {
  const points = Array.isArray(s['요점']) ? s['요점'] : null
  if (points) return <ul className="sem-tl-points">{points.map((p) => <li key={p}>{p}</li>)}</ul>
  return <p className="sem-tl-excerpt">{excerpt(splitSeminarBody(s.body).intro || s.body, 120)}</p>
}

// 타임라인 한 항목. featured(첫 항목=최신) = 제목 타이포 크게.
// v3.1(§6-2a B1·B4): featured ∧ 예정(upcoming) = is-next → 블랙 대면적 밴드 승격(구 N3 버건디 면 철회 —
// 흑백 대비 + 흰 대형 회차/날짜 숫자). 페이지당 블랙 대면적 1개(featured가 유일) — 예정 없으면 밴드 0.
// export = 콘텐츠 무관 단위 테스트용.
export function SeminarTimelineItem({ s, today, featured = false, onOpen = () => {} }) {
  const upcoming = isUpcoming(s, today)
  const thumbs = Array.isArray(s['썸네일']) ? s['썸네일'].filter(Boolean) : []
  const noDate = s['일정미정'] === true

  if (featured && upcoming) {
    return (
      <li className="sem-tl-item is-featured is-next">
        <div className="sem-next-band">
          <div className="sem-next-top">
            <span className="sem-next-kicker"><i className="sem-next-sq" aria-hidden="true" />NEXT SEMINAR</span>
            <span className="sem-soon-badge">예정</span>
          </div>
          <div className="sem-next-figures">
            <span className="sem-next-ep">{s.회차}<span className="sem-next-unit">회</span></span>
            {noDate
              ? <span className="sem-next-when">일정 미정</span>
              : <time className="sem-next-when" dateTime={s.date}>{(s.date || '').replace(/-/g, '.')}</time>}
          </div>
          <Chips s={s} />
          <button type="button" className="sem-tl-title" onClick={() => onOpen(s.slug)}>{s.title}</button>
          <span className="sem-tl-underbar" aria-hidden="true" />
          {thumbs.length > 0 && <SlideThumb thumbs={thumbs} slide={s['슬라이드']} title={s.title} />}
          <Desc s={s} />
        </div>
      </li>
    )
  }

  return (
    <li className={`sem-tl-item${featured ? ' is-featured' : ''}`}>
      <div className="sem-tl-date">
        {noDate
          ? <span className="sem-tl-day">일정 미정</span>
          : <time className="sem-tl-day" dateTime={s.date}>{(s.date || '').replace(/-/g, '.')}</time>}
        {upcoming && <span className="sem-soon-badge">예정</span>}
      </div>
      <div className="sem-tl-body">
        <span className="sem-tl-dot" aria-hidden="true" />
        <Chips s={s} />
        <button type="button" className="sem-tl-title" onClick={() => onOpen(s.slug)}>{s.title}</button>
        {featured && <span className="sem-tl-underbar" aria-hidden="true" />}
        {thumbs.length > 0 && <SlideThumb thumbs={thumbs} slide={s['슬라이드']} title={s.title} />}
        <Desc s={s} />
      </div>
    </li>
  )
}

// 프리젠테이션 리스트 — items(이미 정렬·필터됨)만 받아 항목 렌더. 0건=디자인된 1줄 빈 상태(SPEC §4 v3).
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

// 목록 뷰 컨테이너 — 골격: [PageHead(좌 라벨 SEMINARS × 우 헤드+필터 바)] → [좌 라벨 ARCHIVE × 우 타임라인].
// 폰(≤820px)에서는 상하 적층(CSS). 상태(주제·정렬) = 세션만·URL 미반영.
export default function SeminarsTimeline({ all, today, onOpen }) {
  const [topic, setTopic] = useState(null)
  const [order, setOrder] = useState('newest') // 기본 = 최신순
  const topics = useMemo(() => extractTopics(all), [all])
  const items = useMemo(() => sortSeminars(filterByTopic(all, topic), order), [all, topic, order])
  return (
    <>
      {/* 페이지 헤드 = 공용 PageHead(3차 통일) — 좌 라벨 SEMINARS + 고유 부가 요소(필터 바) = children */}
      <PageHead
        label="SEMINARS"
        title="세미나"
        sub="주기 개최 세미나 아카이브 — 발표자료·기록 축적."
        meta={latestUpdated(all)}
      >
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
      </PageHead>

      <section className="sem-sec sem-sec-archive">
        <span className="sem-col-label"><i className="sem-col-sq" aria-hidden="true" />ARCHIVE</span>
        <div className="sem-sec-body">
          <SeminarTimeline items={items} today={today} onOpen={onOpen} />
        </div>
      </section>
    </>
  )
}
