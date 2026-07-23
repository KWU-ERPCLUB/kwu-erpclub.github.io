// 인사이트 상세 셸 — 문서 헤더·출처 카드·720px 자유 본문·이전/다음 내비. 720px 문서형.
import { Arrow } from '../shared.jsx'
import { neighbors } from './insights-logic.js'
import { TagChips } from './insights-parts.jsx'
import Markdown from './Markdown.jsx'

export default function ArticleDetail({ cur, all, onOpen, onBack }) {
  const { prev, next } = neighbors(all, cur.slug)
  const hasTags = Boolean(cur['성격'] || cur['영역'] || cur['지금써먹기'])
  return (
    <article className="art-detail">
      {/* ① 문서 헤더 블록 — 눈썹·제목·메타·태그 */}
      <header className="art-doc-head">
        <span className="art-idx">AI INSIGHTS</span>
        <h1>{cur.title}</h1>
        <p className="art-detail-meta">{cur.date} · {cur.author}</p>
        {hasTags && <div className="art-detail-tags"><TagChips a={cur} /></div>}
      </header>

      {/* ② 출처 카드 — source_name·source_url 시각 블록 승격 */}
      {cur.source_url && (
        <a className="art-source" href={cur.source_url} target="_blank" rel="noreferrer">
          <span className="art-source-label">출처</span>
          <span className="art-source-name">{cur.source_name || cur.source_url}</span>
          <span className="art-source-go"><Arrow /></span>
        </a>
      )}

      {/* ③ 본문 컨테이너 720px — 기고자 자유(텍스트·이미지·링크·임베드) */}
      <Markdown body={cur.body} />

      {/* ④ 하단 — 목록 복귀 + 이전/다음 인사이트 */}
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
