// AIM 허브 사이트 상세 — 헤더 메타·면별 쇼케이스·남은 것 조각. 본체 = ProjectSite.jsx.
// 규격: 외부 라이브러리 0 · transform·opacity만 · reduced-motion·no-JS = 최종 상태 정적.
// 카피 = 개조식(경어체 금지) · 대시로 절 잇기 금지 · 파일 경로·파일명 표면 금지.
import { Arrow } from '../shared.jsx'
import { authorName } from '../content/authors.js'
import { META, STACK, HERO_STATS, PAGES, NEXT } from '../data/project-site-data.js'

// 헤더 메타 — 전문 프로젝트 게재 표준 항목. 값이 없는 칸은 만들지 않는다.
export function HeaderMeta() {
  const rows = [
    { k: '만든 사람', v: authorName(META.authorId), note: META.authorNote },
    { k: '기간', v: META.period, note: META.periodNote },
    { k: '역할', v: META.roles.join(' · '), note: META.roleNote },
    { k: '상태', v: META.status, note: META.statusNote },
  ]
  return (
    <dl className="ps-meta">
      {rows.map((r) => (
        <div className="ps-meta-cell" key={r.k}>
          <dt>{r.k}</dt>
          <dd>
            {r.v}
            {r.note && <span className="ps-meta-note">{r.note}</span>}
          </dd>
        </div>
      ))}
    </dl>
  )
}

// 기술 스택 — 이름 + 역할 한 줄. 모르는 독자도 무엇에 쓰는지 읽힌다.
export function StackChips() {
  return (
    <ul className="ps-stack" aria-label="기술 스택">
      {STACK.map((s) => (
        <li className="ps-chip" key={s.name}>
          <strong>{s.name}</strong>
          <span>{s.role}</span>
        </li>
      ))}
    </ul>
  )
}

// 라이브·소스 링크. 워크스페이스는 로그인 영역이라 링크를 걸지 않는다.
export function HeaderLinks() {
  return (
    <div className="ps-links">
      <a className="btn-dark" href={META.live} target="_blank" rel="noreferrer">
        사이트 열기 <Arrow />
      </a>
      <a className="btn-2nd" href={META.repo} target="_blank" rel="noreferrer">
        GitHub <Arrow />
      </a>
    </div>
  )
}

// 히어로 수치 — 근거(src) 없는 값은 싣지 않는다.
export function HeaderStats() {
  return (
    <div className="ps-hstats">
      {HERO_STATS.map((s) => (
        <div className="ps-hstat" key={s.label}>
          <span className="ps-hstat-num">{s.value}</span>
          <span className="ps-hstat-label">{s.label}</span>
          <span className="ps-hstat-src">{s.src}</span>
        </div>
      ))}
    </div>
  )
}

// 히어로 모자이크 — 면 6종의 실물 캡처를 한 판에. 아래 쇼케이스가 같은 캡처를 원본 크기로 다시 보인다.
export function HeroMosaic() {
  return (
    <div className="ps-mosaic" aria-hidden="true">
      {PAGES.map((p) => (
        <span className="ps-mos-cell" key={p.id}>
          <img src={p.shot} alt="" loading="lazy" />
          <span className="ps-mos-name">{p.name}</span>
        </span>
      ))}
    </div>
  )
}

// 결정 한 줄 — 물음 → 결정 + 근거. 면별 쇼케이스 안에서 반복된다.
function DecisionRow({ d }) {
  return (
    <li className="ps-dc">
      <p className="ps-dc-flow">
        <span className="ps-dc-q">{d.q}</span>
        <span className="ps-dc-arrow" aria-hidden="true">→</span>
        <strong className="ps-dc-a">{d.a}</strong>
      </p>
      <p className="ps-dc-why">{d.why}</p>
    </li>
  )
}

// 면별 쇼케이스 — 실물 캡처 + 왜 존재하는가 + 지금 모습을 만든 결정. 좌우 교대 배치.
export function PageShowcase() {
  return (
    <div className="ps-pages">
      {PAGES.map((p, i) => (
        <article className={`ps-page${i % 2 === 1 ? ' alt' : ''} ps-rv`} id={`page-${p.id}`} key={p.id}>
          <figure className="ps-page-shot">
            <img src={p.shot} alt={p.alt} loading="lazy" />
          </figure>
          <div className="ps-page-body">
            <header className="ps-page-head">
              <span className="ps-page-idx">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="ps-page-name">{p.name}</h3>
              {p.href
                ? <a className="ps-page-link" href={p.href}>열기 <Arrow /></a>
                : <span className="ps-page-lock">로그인 영역</span>}
            </header>
            <p className="ps-page-role">{p.role}</p>
            <p className="ps-page-lead">{p.lead}</p>
            <ul className="ps-dcs">
              {p.decisions.map((d) => <DecisionRow d={d} key={d.q} />)}
            </ul>
          </div>
        </article>
      ))}
    </div>
  )
}

// 남은 것 — 완료 선언 금지. 진행 중이라는 사실을 그대로 싣는다.
export function NextList() {
  return (
    <ul className="ps-next">
      {NEXT.map((n) => (
        <li className="ps-next-item ps-rv" key={n.k}>
          <strong>{n.k}</strong>
          <span>{n.v}</span>
        </li>
      ))}
    </ul>
  )
}
