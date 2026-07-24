// 인사이트 공용 UI 조각 — 색 면 카드(AI in Use 문법 이식)·태그 칩·핀 배지·썸네일. Articles/Hub 공유.
import { Arrow } from '../shared.jsx'
import { natureKey, authorInitial, excerpt } from './insights-logic.js'

// 썸네일 타일 — 이미지(로고 = /img/logos/) 있을 때만 렌더. fallback 아이콘 타일 폐지(카드 색이 성격을 말함).
export function Thumb({ a }) {
  return (
    <span className="art-thumb">
      <img src={a['이미지']} alt="" loading="lazy" />
    </span>
  )
}

// 핀 배지 — 고정 항목 표시(작은 핀 아이콘 + 스크린리더 텍스트).
export function PinBadge() {
  return (
    <span className="art-pin" title="고정">
      <svg width="11" height="11" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <path d="M9.5 1.5L12.5 4.5L10 7L11 11L7 8.5L3 11L4 6.5L1.5 4.5L5 4L7 0.8" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      </svg>
      <span className="sr-only">고정</span>
    </span>
  )
}

// 태그 칩 줄 — 성격 칩·주제 칩·지금써먹기 배지(상세 페이지 전용 — 목록 카드는 분산 배치).
export function TagChips({ a }) {
  return (
    <span className="art-row-tags">
      {a['성격'] && <span className="art-tag art-tag-nature">{a['성격']}</span>}
      {a['주제'] && <span className="art-tag">{a['주제']}</span>}
      {a['지금써먹기'] && <span className="art-tag art-tag-now">지금 써먹기</span>}
    </span>
  )
}

// 색 면 카드(AI in Use 이식) — 배경=성격별 저채도 4색, 진한 보더(--dark 1.5px)+옅은 그림자.
// 구조: [상단 메타: 아바타·저자 / 우상단 날짜] → 제목(볼드) → 주제 칩(흰 필) → 요약 2~3줄
//   → [하단: 성격 태그(진한 필)·지금써먹기 배지 + "자세히 →"]. 썸네일=이미지 있을 때만.
export function ArticleRow({ a, onOpen, pinned = false }) {
  const nk = natureKey(a['성격'])
  const ex = excerpt(a.body, 140)
  return (
    <li className={`art-card art-card--${nk}`}>
      <button type="button" onClick={() => onOpen(a.slug)}>
        <span className="art-card-body">
          <span className="art-card-meta">
            <span className="art-avatar" aria-hidden="true">{authorInitial(a.author)}</span>
            <span className="art-card-author">{a.author}</span>
            <span className="art-card-date">{(a.date || '').slice(0, 10)}</span>
          </span>
          <span className="art-card-title">
            {pinned && <PinBadge />}
            {a.title}
          </span>
          {a['주제'] && <span className="art-card-topic">{a['주제']}</span>}
          {ex && <span className="art-card-excerpt">{ex}</span>}
          <span className="art-card-foot">
            <span className="art-row-tags">
              {a['성격'] && <span className="art-tag art-tag-nature">{a['성격']}</span>}
              {a['지금써먹기'] && <span className="art-tag art-tag-now">지금 써먹기</span>}
            </span>
            <span className="art-card-more">자세히 <Arrow /></span>
          </span>
        </span>
        {a['이미지'] && <Thumb a={a} />}
      </button>
    </li>
  )
}
