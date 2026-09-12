// 인사이트 상세 셸 — 문서 헤더·히어로 이미지·출처 카드·640px 자유 본문·이전/다음 내비. 640px 문서형.
import { useEffect } from 'react'
import { Arrow } from '../shared.jsx'
import { neighbors } from './insights-logic.js'
import { TagChips, dateTimeOf } from './insights-parts.jsx'
import { authorName } from '../content/authors.js'
import { resolveHero, seriesBadge } from './thumb-resolver.js'
import Markdown from './Markdown.jsx'
import ArticleActions from './ArticleActions.jsx'

// 히어로 — 기고 맨 위 이미지 + 그 이미지가 무엇인지 밝히는 캡션 줄(오너 판정 2026-08-05).
// 2026-09-11: 목록 카드와 같은 실제 이미지 1계층. 없으면 통째로 생략(레거시 보관 글). 주간 = 주차 배지.
export function ArticleHero({ a }) {
  const hero = resolveHero(a)
  if (!hero) return null
  const badge = seriesBadge(a)
  return (
    <figure className={`art-hero art-hero--fit-${hero.fit}`}>
      <img src={hero.src} alt={hero.caption} />
      {badge && <span className="art-cover-badge">{badge}</span>}
      {hero.caption && <figcaption className="art-hero-cap">{hero.caption}</figcaption>}
    </figure>
  )
}

// 본문 진입 리빌(2026-09-12 오너: "서식·애니메이션 요소가 덜 들어가 가독성이 떨어진다") — 블록 단위 once 리빌.
// 규격 = 홈 리빌과 동일(transform·opacity만 · reduced-motion = 게이트 미부여 → CSS 감쇠 자체가 꺼짐 · JS 없음 = 정적 선명).
function useArticleReveal(slug) {
  useEffect(() => {
    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') return undefined
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
    const root = document.documentElement
    root.classList.add('art-js')
    const targets = Array.from(document.querySelectorAll('.art-hero, .art-source, .hub-md > *'))
    const io = new IntersectionObserver((entries) => {
      for (const en of entries) if (en.isIntersecting) { en.target.classList.add('seen'); io.unobserve(en.target) }
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 })
    targets.forEach((t) => io.observe(t))
    // 첫 화면 위쪽에 이미 있는 블록은 즉시 표시(스크롤 없이도 보이게)
    const vh = window.innerHeight
    targets.forEach((t) => { if (t.getBoundingClientRect().top < vh * 0.9) t.classList.add('seen') })
    return () => { io.disconnect(); root.classList.remove('art-js') }
  }, [slug])
}

// interactions = useInteractions() 반환값(선택). 미전달·미설정이면 상호작용 줄 자체가 렌더되지 않는다.
export default function ArticleDetail({ cur, all, onOpen, onBack, interactions }) {
  useArticleReveal(cur.slug)
  const { prev, next } = neighbors(all, cur.slug)
  const hasTags = Boolean(cur['성격'] || cur['축'] || cur['주제'] || cur['지금써먹기'])
  return (
    <article className="art-detail">
      {/* ⓪ 보관 글 안내(2026-09-11) — 목록에서는 빠졌지만 주소는 살아 있다 */}
      {cur['보관'] === true && <p className="art-archived" role="note">보관 글 · 현재 발행 기준 밖</p>}
      {/* ① 문서 헤더 블록 — 눈썹·제목·메타·태그 */}
      <header className="art-doc-head">
        <span className="art-idx">AI INSIGHTS</span>
        <h1>{cur.title}</h1>
        <p className="art-detail-meta">{dateTimeOf(cur)} · {authorName(cur.author)}</p>
        {hasTags && <div className="art-detail-tags"><TagChips a={cur} /></div>}
        <ArticleActions articleId={cur.id} api={interactions} />
      </header>

      {/* ② 히어로 — 내용과 실제 관련된 이미지 + 캡션(무엇인지·기사와의 관계) */}
      <ArticleHero a={cur} />

      {/* ③ 출처 카드 — source_name·source_url 시각 블록 승격 */}
      {cur.source_url && (
        <a className="art-source" href={cur.source_url} target="_blank" rel="noreferrer">
          <span className="art-source-label">출처</span>
          <span className="art-source-name">{cur.source_name || cur.source_url}</span>
          <span className="art-source-go"><Arrow /></span>
        </a>
      )}

      {/* ④ 본문 — md=사이트 서식 렌더 / html=자유 디자인 트랙(0008): 샌드박스 iframe 원형 그대로.
          sandbox 빈 값 = 스크립트·폼·same-origin 전부 차단(제출물의 CSS·마크업만 살림). */}
      {cur['형식'] === 'html'
        ? <iframe className="art-htmlframe" title={cur.title} sandbox="" srcDoc={cur.body} />
        : <Markdown body={cur.body} />}

      {/* ⑤ 하단 — 목록 복귀 + 이전/다음 인사이트 */}
      <nav className="art-foot" aria-label="인사이트 이동">
        <button type="button" className="art-back" onClick={onBack}>← 목록</button>
        {(prev || next) && (
          <div className="art-foot-nav">
            {prev && (
              <button type="button" className="art-nav-link" onClick={() => onOpen(prev.slug)}>
                <span className="art-nav-dir">← 이전</span>
                <span className="art-nav-title">{prev.title}</span>
              </button>
            )}
            {next && (
              <button type="button" className="art-nav-link art-nav-next" onClick={() => onOpen(next.slug)}>
                <span className="art-nav-dir">다음 →</span>
                <span className="art-nav-title">{next.title}</span>
              </button>
            )}
          </div>
        )}
      </nav>
    </article>
  )
}
