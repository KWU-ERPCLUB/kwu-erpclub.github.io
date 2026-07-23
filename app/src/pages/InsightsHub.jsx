// 허브 뷰(전체 탭) — 성격 4섹션. 섹션 = 헤더(성격+정의) + 고정(최상단) + 최신 2 + 전체 보기.
import { CONTRIBUTING_URL } from '../shared.jsx'
import { NATURES } from '../content/schema.js'
import { NATURE_DEFS, hubSection } from './insights-logic.js'
import { ArticleRow } from './insights-parts.jsx'

// 항목 0건 섹션 = 한 줄 빈 상태. 항목 있으면 고정→최신 순 행 렌더 + 전체 보기 링크.
function HubSection({ nature, all, onOpen, onTab }) {
  const { pinned, rest, total } = hubSection(all, nature, 2)
  return (
    <section className="hub-sec">
      <header className="hub-sec-head">
        <h2 className="hub-sec-title">{nature}</h2>
        <p className="hub-sec-def">{NATURE_DEFS[nature]}</p>
      </header>
      {total === 0 ? (
        <p className="hub-sec-empty">기고 아직 없음 — 이 성격의 첫 글 대기 중.</p>
      ) : (
        <>
          <ul className="art-list">
            {pinned.map((a) => <ArticleRow key={a.slug} a={a} onOpen={onOpen} pinned />)}
            {rest.map((a) => <ArticleRow key={a.slug} a={a} onOpen={onOpen} />)}
          </ul>
          <button type="button" className="hub-sec-more" onClick={() => onTab(nature)}>
            전체 보기 ({total}) →
          </button>
        </>
      )}
    </section>
  )
}

export default function InsightsHub({ all, onOpen, onTab }) {
  return (
    <div className="hub-view">
      {NATURES.map((n) => (
        <HubSection key={n} nature={n} all={all} onOpen={onOpen} onTab={onTab} />
      ))}
      <p className="hub-guide">
        기고 방법 = <a href={CONTRIBUTING_URL} target="_blank" rel="noreferrer">기고 가이드(CONTRIBUTING.md)</a> — 성격 판정·파일명 규칙·이미지·고정 필드 안내.
      </p>
    </div>
  )
}
