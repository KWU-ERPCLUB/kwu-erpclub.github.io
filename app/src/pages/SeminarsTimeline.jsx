// 세미나 목록 v4 (2026-08-06 외부 피드백 개편) — 구 세로 날짜 타임라인(가로줄·좌 라벨 레일) 폐지.
// 구조 = [PageHead(중앙) + 필터 바] → [상단 반 = 최신·다음 세미나 피처 밴드] → [아래 = 과거 세미나 3열 카드 그리드].
// 피처 밴드: 예정이면 블랙 밴드(NEXT SEMINAR) / 과거면 라이트 밴드(LATEST SEMINAR) — 같은 골격.
// CTA 명확화(피드백 "눌러야 될 것 같이 안 생겼다") = "발표자료 PDF 열기" 문장 버튼.
// 상세(SeminarDetail)는 별도. 필터·정렬 = 세션 상태만(URL 미반영). all/today는 상위(Seminars)가 주입.
import { useMemo, useState } from 'react'
import { excerpt, splitSeminarBody, sortSeminars, extractTopics, filterByTopic, isUpcoming } from './seminars-logic.js'
import { PageHead } from '../shared.jsx'

// 항목 공용 조각 — 메타 칩(회차·유형·주제) / 설명(요점 불릿 ∨ 본문 발췌).
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

function whenLabel(s) {
  return s['일정미정'] === true ? '일정 미정' : (s.date || '').replace(/-/g, '.')
}

// 상단 피처 밴드 — 리스트 첫 항목(최신·다음). 예정 = 블랙 밴드 / 과거 = 라이트 밴드(같은 골격).
// export = 콘텐츠 무관 단위 테스트용.
export function SeminarFeature({ s, today, onOpen = () => {} }) {
  const upcoming = isUpcoming(s, today)
  const thumbs = Array.isArray(s['썸네일']) ? s['썸네일'].filter(Boolean) : []
  return (
    <section className={`sem-feat${upcoming ? ' is-next' : ''}`} aria-label={upcoming ? '다음 세미나' : '최신 세미나'}>
      <div className="sem-feat-in">
        <div className="sem-feat-txt">
          <div className="sem-next-top">
            <span className="sem-next-kicker">{upcoming ? 'NEXT SEMINAR' : 'LATEST SEMINAR'}</span>
            {upcoming && <span className="sem-soon-badge">예정</span>}
          </div>
          <div className="sem-next-figures">
            <span className="sem-next-ep">{s.회차}<span className="sem-next-unit">회</span></span>
            <span className="sem-next-when">{whenLabel(s)}</span>
          </div>
          <Chips s={s} />
          <button type="button" className="sem-tl-title" onClick={() => onOpen(s.slug)}>{s.title}</button>
          <Desc s={s} />
          <div className="sem-feat-actions">
            <button type="button" className="btn-2nd" onClick={() => onOpen(s.slug)}>세미나 내용 보기</button>
            {s['슬라이드'] && (
              <a className="btn-2nd" href={s['슬라이드']} target="_blank" rel="noreferrer">발표자료 PDF 열기</a>
            )}
          </div>
        </div>
        {thumbs.length > 0 && (
          <a
            className="sem-feat-thumb" href={s['슬라이드'] || undefined} target="_blank" rel="noreferrer"
            aria-label="발표자료 열기"
          >
            <img src={thumbs[0]} alt={`${s.title} 발표자료 미리보기`} loading="lazy" />
          </a>
        )}
      </div>
    </section>
  )
}

// 과거 세미나 카드 — 3열 그리드 항목(썸네일 · 날짜 · 칩 · 제목 · PDF 링크).
// export = 콘텐츠 무관 단위 테스트용.
export function SeminarCard({ s, today, onOpen = () => {} }) {
  const upcoming = isUpcoming(s, today)
  const thumbs = Array.isArray(s['썸네일']) ? s['썸네일'].filter(Boolean) : []
  return (
    <li className="sem-card">
      <button type="button" className="sem-card-main" onClick={() => onOpen(s.slug)}>
        {thumbs.length > 0 && (
          <span className="sem-card-thumb"><img src={thumbs[0]} alt="" loading="lazy" /></span>
        )}
        <span className="sem-card-body">
          <span className="sem-card-meta">
            <span className="sem-card-date">{whenLabel(s)}</span>
            {upcoming && <span className="sem-soon-badge">예정</span>}
          </span>
          <Chips s={s} />
          <span className="sem-card-title">{s.title}</span>
        </span>
      </button>
      {s['슬라이드'] && (
        <a className="sem-card-pdf" href={s['슬라이드']} target="_blank" rel="noreferrer">발표자료 PDF 열기</a>
      )}
    </li>
  )
}

// 프리젠테이션 리스트 — items(이미 정렬·필터됨): 첫 항목 = 피처 밴드, 나머지 = 3열 그리드.
// 0건 = 디자인된 1줄 빈 상태. export = 픽스처 주입 테스트용(순수 렌더).
export function SeminarTimeline({ items, today, onOpen = () => {} }) {
  if (!items || items.length === 0) {
    return <p className="sem-tl-empty">세미나 기록 아직 없음.</p>
  }
  const [first, ...rest] = items
  return (
    <div className="sem-arch">
      <SeminarFeature s={first} today={today} onOpen={onOpen} />
      {rest.length > 0 && (
        <ol className="sem-grid">
          {rest.map((s) => <SeminarCard key={s.slug} s={s} today={today} onOpen={onOpen} />)}
        </ol>
      )}
    </div>
  )
}

// 목록 뷰 컨테이너 — [PageHead(중앙·문장형 설명) + 필터 바] → [피처 밴드 + 그리드].
// 상태(주제·정렬) = 세션만·URL 미반영.
export default function SeminarsTimeline({ all, today, onOpen }) {
  const [topic, setTopic] = useState(null)
  const [order, setOrder] = useState('newest') // 기본 = 최신순
  const topics = useMemo(() => extractTopics(all), [all])
  const items = useMemo(() => sortSeminars(filterByTopic(all, topic), order), [all, topic, order])
  return (
    <>
      <PageHead
        label="SEMINARS"
        title="세미나"
        sub="스터디 세미나를 회차별로 기록하는 공간입니다 — 발표자료를 내려받을 수 있습니다."
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

      <SeminarTimeline items={items} today={today} onOpen={onOpen} />
    </>
  )
}
