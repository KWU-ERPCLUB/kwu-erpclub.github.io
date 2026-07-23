// 인사이트 공용 UI 조각 — 썸네일·태그 칩·핀 배지·기사 카드. Articles/Hub 공유.
import { natureKey, authorInitial, excerpt } from './insights-logic.js'

// 성격별 기본 아이콘(자체 제작 라인 SVG — 텍스트 타일 폐기, owner 2026-07-23).
// 뉴스·동향=신문 / 심층 분석=문서+돋보기 / 활용법·튜토리얼=번호 단계 / 도구·프롬프트=터미널 프롬프트.
const NATURE_ICONS = {
  news: (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="4.5" width="15" height="15" rx="1.6" stroke="currentColor" strokeWidth="1.5" />
      <path d="M18 8h1.6c.8 0 1.4.6 1.4 1.4v8.1a2 2 0 0 1-2 2H5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6 8.5h6M6 11.5h9M6 14.5h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  analysis: (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 3.5h8.5L19 8v12a1.5 1.5 0 0 1-1.5 1.5H6A1.5 1.5 0 0 1 4.5 20V5A1.5 1.5 0 0 1 6 3.5Z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M14.5 3.5V8H19" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="10.5" cy="13.5" r="2.8" stroke="currentColor" strokeWidth="1.5" />
      <path d="m12.7 15.7 2.6 2.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  howto: (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="6" cy="6" r="2.2" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="6" cy="12.5" r="2.2" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="6" cy="19" r="2.2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M11 6h8M11 12.5h8M11 19h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  tools: (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="4.5" width="18" height="15" rx="1.8" stroke="currentColor" strokeWidth="1.5" />
      <path d="m7 9.5 3 2.5-3 2.5M12.5 15H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
}

// 썸네일 타일 — `이미지` 있으면 소형 이미지, 없으면 성격 색 타일 + 성격 아이콘(성격별 저채도 배경).
export function Thumb({ a }) {
  if (a['이미지']) {
    return <span className="art-thumb"><img src={a['이미지']} alt="" loading="lazy" /></span>
  }
  const nk = natureKey(a['성격'])
  return (
    <span className={`art-thumb art-tile art-tile--${nk}`} aria-hidden="true">
      {NATURE_ICONS[nk]}
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
