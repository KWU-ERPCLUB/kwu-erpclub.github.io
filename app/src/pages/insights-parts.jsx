// 인사이트 공용 UI 조각 — 썸네일·태그 칩·핀 배지·기사 행. Articles/Hub 공유.
import { natureKey, monogram } from './insights-logic.js'

// 썸네일 타일 — `이미지` 있으면 소형 이미지, 없으면 성격 모노그램 fallback(성격별 저채도 배경).
export function Thumb({ a }) {
  if (a['이미지']) {
    return <span className="art-thumb"><img src={a['이미지']} alt="" loading="lazy" /></span>
  }
  const nk = natureKey(a['성격'])
  return (
    <span className={`art-thumb art-mono art-mono--${nk}`} aria-hidden="true">
      {monogram(a['성격'])}
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

export function TagChips({ a }) {
  return (
    <span className="art-row-tags">
      {a['성격'] && <span className="art-tag art-tag-nature">{a['성격']}</span>}
      {a['영역'] && <span className="art-tag">{a['영역']}</span>}
      {a['지금써먹기'] && <span className="art-tag art-tag-now">지금 써먹기</span>}
    </span>
  )
}

// 조밀 행 — 썸네일 | (제목 + 메타·태그). 목록·허브 공용. pinned=핀 배지.
export function ArticleRow({ a, onOpen, pinned = false }) {
  return (
    <li className="art-row">
      <button type="button" onClick={() => onOpen(a.slug)}>
        <Thumb a={a} />
        <span className="art-row-body">
          <span className="art-row-title">
            {pinned && <PinBadge />}
            {a.title}
          </span>
          <span className="art-row-meta">
            <span className="art-row-date">{(a.date || '').slice(5)}</span>
            <span className="art-row-sep" aria-hidden="true">·</span>
            <span className="art-row-author">{a.author}</span>
            <TagChips a={a} />
          </span>
        </span>
      </button>
    </li>
  )
}
