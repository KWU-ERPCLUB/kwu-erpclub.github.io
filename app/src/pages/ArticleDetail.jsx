// 인사이트 상세 셸 — 문서 헤더·히어로 이미지·출처 카드·720px 자유 본문·이전/다음 내비. 720px 문서형.
import { Arrow } from '../shared.jsx'
import { neighbors } from './insights-logic.js'
import { TagChips, dateTimeOf } from './insights-parts.jsx'
import { resolveHero } from './thumb-resolver.js'
import SeriesCover from './SeriesCover.jsx'
import Markdown from './Markdown.jsx'
import ArticleActions from './ArticleActions.jsx'

// 히어로 — 기고 맨 위 이미지 + 그 이미지가 무엇인지 밝히는 캡션 줄(오너 판정 2026-08-05).
// 명시 `이미지`가 없으면 통째로 생략(자동 커버는 목록 전용). `이미지설명`이 없으면 캡션 줄만 생략.
// 시리즈 글 = 컴포넌트형 고정 커버(SeriesCover) + 자동 캡션.
export function ArticleHero({ a }) {
  const hero = resolveHero(a)
  if (!hero) return null
  return (
    <figure className={`art-hero art-hero--fit-${hero.fit}`}>
      {hero.cover
        ? <SeriesCover id={hero.cover} a={a} className="art-hero-svg" />
        : <img src={hero.src} alt={hero.caption} />}
      {hero.caption && <figcaption className="art-hero-cap">{hero.caption}</figcaption>}
    </figure>
  )
}

// interactions = useInteractions() 반환값(선택). 미전달·미설정이면 상호작용 줄 자체가 렌더되지 않는다.
export default function ArticleDetail({ cur, all, onOpen, onBack, interactions }) {
  const { prev, next } = neighbors(all, cur.slug)
  const hasTags = Boolean(cur['성격'] || cur['주제'] || cur['지금써먹기'])
  return (
    <article className="art-detail">
      {/* ① 문서 헤더 블록 — 눈썹·제목·메타·태그 */}
      <header className="art-doc-head">
        <span className="art-idx">AI INSIGHTS</span>
        <h1>{cur.title}</h1>
        <p className="art-detail-meta">{dateTimeOf(cur)} · {cur.author}</p>
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
