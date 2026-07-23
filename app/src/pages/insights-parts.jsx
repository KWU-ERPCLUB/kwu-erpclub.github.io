// 인사이트 공용 UI 조각 — 썸네일·태그 칩·핀 배지·기사 카드. Articles/Hub 공유.
import { natureKey, authorInitial, excerpt } from './insights-logic.js'

// 썸네일 타일 — `이미지` 있으면 소형 이미지, 없으면 성격 색 타일 + 성격명 풀 텍스트(성격별 저채도 배경).
export function Thumb({ a }) {
  if (a['이미지']) {
    return <span className="art-thumb"><img src={a['이미지']} alt="" loading="lazy" /></span>
  }
  const nk = natureKey(a['성격'])
  return (
    <span className={`art-thumb art-tile art-tile--${nk}`} aria-hidden="true">
      {a['성격']}
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

// 하단 칩 줄 — 성격 칩·주제 칩·지금써먹기 배지.
export function TagChips({ a }) {
  return (
    <span className="art-row-tags">
      {a['성격'] && <span className="art-tag art-tag-nature">{a['성격']}</span>}
      {a['주제'] && <span className="art-tag">{a['주제']}</span>}
      {a['지금써먹기'] && <span className="art-tag art-tag-now">지금 써먹기</span>}
    </span>
  )
}

// 풀폭 카드 — [본문(메타·제목·요약·칩) | 썸네일]. 목록·허브 공용. pinned=핀 배지.
export function ArticleRow({ a, onOpen, pinned = false }) {
  const ex = excerpt(a.body)
  return (
    <li className="art-card">
      <button type="button" onClick={() => onOpen(a.slug)}>
        <span className="art-card-body">
          <span className="art-card-meta">
            <span className="art-avatar" aria-hidden="true">{authorInitial(a.author)}</span>
            <span className="art-card-author">{a.author}</span>
            <span className="art-row-sep" aria-hidden="true">·</span>
            <span className="art-card-date">{(a.date || '').slice(0, 10)}</span>
          </span>
          <span className="art-card-title">
            {pinned && <PinBadge />}
            {a.title}
          </span>
          {ex && <span className="art-card-excerpt">{ex}</span>}
          <TagChips a={a} />
        </span>
        <Thumb a={a} />
      </button>
    </li>
  )
}
