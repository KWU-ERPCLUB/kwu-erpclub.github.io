// 인사이트 공용 UI 조각 — 썸네일 카드(오너 픽 2026-08-05 B·C). 색면 카드 폐지: 카드 배경 = 흰/중립 통일,
// 성격 = 컬러 라벨로 강등. 그리드 카드 요소 상한 = [썸네일 · 성격 라벨 · 제목 · 설명 1문장 · 날짜].
// 해시태그·아바타 = 카드에서 제거(데이터는 유지 — 상세에서만 표시).
// + v3.1(§6-2a, 2026-08-05 2차) 골격 조각: SectionLabel(B2 좌 라벨 컬럼).
//   v3.2(오너 피드백 2026-08-05): 블랙 통계 밴드(StatBand) 완전 제거 — 인사이트 디자인은 이것으로 확정.
import { natureKey } from './insights-logic.js'
import { resolveThumb } from './thumb-resolver.js'
import { InsightCover } from './insights-cover.jsx'
import SeriesCover from './SeriesCover.jsx'

// 썸네일 프레임 — 전 계층 동일 비율(16:10)·동일 보더. 사진=cover / 로고·도판=contain(+여백).
// 4계층 해석은 thumb-resolver가 담당. SVG 컴포넌트 = 시리즈 커버(⓪ SeriesCover)·자동 커버(④ InsightCover).
// alt = `이미지설명`(명시 이미지일 때만). 자동 폴백 이미지는 alt='' = 장식 취급(스크린리더가 건너뜀).
export function Thumb({ a, big = false }) {
  const t = resolveThumb(a)
  const cls = `art-cover${big ? ' art-cover--big' : ''} art-cover--${t.kind} art-cover--fit-${t.fit}`
  return (
    <span className={cls}>
      {t.cover ? <SeriesCover id={t.cover} a={a} />
        : t.src ? <img src={t.src} alt={t.alt} loading="lazy" />
          : <InsightCover a={a} />}
    </span>
  )
}

// (구 SectionLabel — 좌 고정 ■ 라벨 = 4차 개편 2026-08-06에서 폐지. 구간 제목 = .ins-h 중앙 헤딩.)

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

// 날짜(+게재 시각) 표기 — 시각 필드 있으면 "YYYY-MM-DD HH:MM"(2026-07-25 오너 지시).
export function dateTimeOf(a) {
  const d = (a.date || '').slice(0, 10)
  return a['시각'] ? `${d} ${a['시각']}` : d
}

// 작성자 배지(2026-08-07 오너) — 시간 옆 이름 3글자, 검은 타원 배경 + 흰 글씨.
export function AuthorBadge({ a }) {
  const name = String(a.author || '').trim()
  if (!name) return null
  return <span className="art-author" title={name}>{name.slice(0, 3)}</span>
}

// 미열람 N 배지(2026-08-07 오너) — 카드 우상단 빨간 원. 게재 7일 이내 + 이 기기 미열람만(판정 = seen-store isNew).
export function NewBadge() {
  return <span className="art-new" aria-label="안 읽음">N</span>
}

// 좋아요·북마크 수(2026-08-07 오너) — 카드 우하단. counts 없으면(비연결·0/0) 표시 생략.
export function CountBadges({ counts }) {
  const likes = counts?.['좋아요수'] || 0
  const marks = counts?.['북마크수'] || 0
  if (!likes && !marks) return null
  return (
    <span className="art-counts" aria-label={`좋아요 ${likes} · 북마크 ${marks}`}>
      <span>♥ {likes}</span>
      <span>🔖 {marks}</span>
    </span>
  )
}

// 태그 칩 줄 — 성격(성격색 칩)·주제·지금써먹기. 상세 전용(카드에서는 제거, 2026-08-05).
export function TagChips({ a }) {
  const nk = natureKey(a['성격'])
  return (
    <span className="art-row-tags">
      {a['성격'] && <span className={`art-tag art-tag-nature chip-${nk}`}>{a['성격']}</span>}
      {a['주제'] && <span className="art-tag">{a['주제']}</span>}
      {a['지금써먹기'] && <span className="art-tag art-tag-now">지금 써먹기</span>}
    </span>
  )
}

// 성격 컬러 라벨 — 색면 강등분(면=카드 배경 아님, 작은 라벨 1개).
export function NatureLabel({ a }) {
  if (!a['성격']) return null
  return <span className={`art-label chip-${natureKey(a['성격'])}`}>{a['성격']}</span>
}

// 카드 메타 줄 — 날짜 + 작성자 배지(좌) / 좋아요·북마크 수(우하단 끝, 2026-08-07).
function CardMeta({ a, counts }) {
  return (
    <span className="art-card-meta">
      <span className="art-card-date">{dateTimeOf(a)}</span>
      <AuthorBadge a={a} />
      <CountBadges counts={counts} />
    </span>
  )
}

// 그리드 카드 — 썸네일 + 성격 라벨 + 제목 + 설명(clamp) + 메타(날짜·작성자·수치). 배경 통일(흰 면).
export function ArticleRow({ a, onOpen, pinned = false, counts = null, fresh = false }) {
  return (
    <li className="art-card">
      <button type="button" onClick={() => onOpen(a.slug)}>
        {fresh && <NewBadge />}
        <Thumb a={a} />
        <span className="art-card-body">
          <span className="art-card-labels">
            {pinned && <PinBadge />}
            <NatureLabel a={a} />
          </span>
          <span className="art-card-title">{a.title}</span>
          {a['설명'] && <span className="art-card-excerpt">{a['설명']}</span>}
          <CardMeta a={a} counts={counts} />
        </span>
      </button>
    </li>
  )
}

// 피처 카드 — 최신 기고 2건 전용. 4차: 콤팩트(썸네일 좌측·크기 반 — 피드백 "사이즈 줄여서 두 개만").
export function FeatureCard({ a, onOpen, pinned = false, counts = null, fresh = false }) {
  return (
    <li className="art-feature">
      <button type="button" onClick={() => onOpen(a.slug)}>
        {fresh && <NewBadge />}
        <Thumb a={a} />
        <span className="art-card-body">
          <span className="art-card-labels">
            {pinned && <PinBadge />}
            <NatureLabel a={a} />
          </span>
          <span className="art-card-title">{a.title}</span>
          {a['설명'] && <span className="art-card-excerpt">{a['설명']}</span>}
          <CardMeta a={a} counts={counts} />
        </span>
      </button>
    </li>
  )
}
