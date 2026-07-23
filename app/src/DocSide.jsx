// 내부형 페이지 공용 사이드바 — 문서 트리 단일원천 (디자인규칙 v2 §3)
const DOCS = [
  ['운영 기록', '/log/'],
]
const PLANNED = ['회의록 (예정)', '플레이북 (예정)']

export default function DocSide({ current, sections }) {
  return (
    <aside className="doc-side">
      <nav aria-label="내부 문서">
        <span className="side-label">이 페이지</span>
        {sections.map(([label, hash]) => (
          <a key={hash} href={hash}>{label}</a>
        ))}
        <span className="side-label" style={{ marginTop: '1.25rem' }}>내부 문서</span>
        {DOCS.map(([label, href]) => (
          <a key={href} href={href} className={current === href ? 'on' : undefined}>{label}</a>
        ))}
        {PLANNED.map((label) => (
          <a key={label} href="#" aria-disabled="true">{label}</a>
        ))}
      </nav>
    </aside>
  )
}
