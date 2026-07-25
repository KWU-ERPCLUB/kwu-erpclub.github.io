import { useCallback, useEffect, useMemo, useState } from 'react'
import { SiteNav, SiteFooter, Arrow, CONTRIBUTING_URL } from '../shared.jsx'
import { loadContent } from '../content/loader.js'
import { LAB_HEADINGS } from '../content/schema.js'
import { splitByDate, todayString, excerpt, daysUntil, ddayLabel } from './seminars-logic.js'
import Markdown from './Markdown.jsx'

// 본문을 `## <헤딩>`으로 분할 → { intro, sections: { 헤딩: 본문 } }. 순수 함수 — 테스트 대상.
export function splitSeminarBody(body) {
  const parts = (body || '').split(/^##\s+/m)
  const intro = (parts[0] || '').trim()
  const sections = {}
  for (let i = 1; i < parts.length; i++) {
    const nl = parts[i].indexOf('\n')
    const heading = (nl === -1 ? parts[i] : parts[i].slice(0, nl)).trim()
    sections[heading] = nl === -1 ? '' : parts[i].slice(nl + 1).trim()
  }
  return { intro, sections }
}

// 히어로 리드 = 본문 첫 단락 발췌(마크다운 제거·1~2문장 분량).
function heroLead(body) {
  const { intro } = splitSeminarBody(body)
  return excerpt(intro || body, 120)
}

// 구성 미리보기 셀 발췌 — 해당 섹션 본문 첫 줄 발췌(빈 섹션 = 안내 문구).
function sectionPreview(sections, heading, n = 60) {
  return excerpt((sections[heading] || '').trim(), n) || '내용 준비 중'
}

// 일시·장소·발제자 한 줄(마이크로) — 장소는 있을 때만.
function metaLine(s) {
  return [s.date, s['장소'], `발제 ${s.author}`].filter(Boolean).join(' · ')
}

function Chips({ s }) {
  return (
    <span className="hub-chips">
      <span className="hub-chip">{s.회차}회</span>
      <span className="hub-chip">{s.유형}</span>
    </span>
  )
}

// 서문(intro)을 리드(첫 단락) + 나머지로 분할. 순수 함수 — 테스트 대상.
export function splitLead(intro) {
  const t = (intro || '').trim()
  if (!t) return { lead: '', rest: '' }
  const parts = t.split(/\n\s*\n/)
  return { lead: parts[0].trim(), rest: parts.slice(1).join('\n\n').trim() }
}

// NEXT 히어로 = 풀블리드 밴드. 눈썹 → D-day 대형 + 초대형 타이틀 → 리드·메타 → 구성 미리보기(실습) →
// 사전준비 배지 + 자세히(Primary). 강조 = 버건디 화이트리스트(눈썹④·언더바③·prep⑤·arrow②) ≤4.
export function NextHero({ s, today, onOpen }) {
  const { sections } = splitSeminarBody(s.body)
  const isLab = s.유형 === '실습'
  const hasPrep = Boolean((sections['준비'] || '').trim())
  const dday = ddayLabel(daysUntil(s.date, today))
  return (
    <section className="sem-next" aria-labelledby="sem-next-title">
      <div className="sem-next-in">
        <span className="sem-next-eyebrow">NEXT</span>
        <div className="sem-next-lead-row">
          <div className="sem-dday">
            <span className="sem-dday-num">{dday}</span>
            <span className="sem-dday-cap">개최까지</span>
          </div>
          <div className="sem-next-headwrap">
            <h1 className="sem-next-title" id="sem-next-title">{s.title}</h1>
            {heroLead(s.body) && <p className="sem-next-lead">{heroLead(s.body)}</p>}
            <p className="sem-next-meta">{metaLine(s)}</p>
            <Chips s={s} />
          </div>
        </div>

        {isLab && (
          <ol className="sem-toc-preview" aria-label="세미나 구성">
            {LAB_HEADINGS.map((h, i) => (
              <li className="sem-toc-cell" key={h}>
                <span className="sem-toc-no">{String(i + 1).padStart(2, '0')}</span>
                <span className="sem-toc-title">{h}</span>
                <span className="sem-toc-desc">{sectionPreview(sections, h)}</span>
              </li>
            ))}
          </ol>
        )}

        <div className="sem-next-foot">
          {hasPrep && <span className="sem-prep-badge">사전 준비 필요</span>}
          <button type="button" className="cta sem-cta" onClick={() => onOpen(s.slug)}>
            자세히 <span className="arrow"><Arrow /></span>
          </button>
        </div>
      </div>
    </section>
  )
}

// 예정 0건 — 풀블리드 빈 상태(§3-1: 무엇이 쌓이는지 + 기고 방법). 규모만 상향, 카피 재사용.
export function NextEmpty() {
  return (
    <section className="sem-next sem-next-empty">
      <div className="sem-next-in">
        <span className="sem-next-eyebrow">NEXT</span>
        <h1 className="sem-next-empty-title">다음 세미나 준비 중 — 주제 확정 시 게재.</h1>
        <p className="sem-next-empty-how">
          기고 = <a href={CONTRIBUTING_URL} target="_blank" rel="noreferrer">기고 가이드</a> 참고 →
          <code> content/세미나/_template.md</code> 복사 → 규칙 채움 → 자동 게재.
        </p>
      </div>
    </section>
  )
}

// 지난 세미나 한 항목 = 초대형 회차 번호 카드(아코디언 폐지·NN/g 접지 않기). 좌측 초대형 회차 숫자 +
// 우측 제목·메타·요점 불릿(없으면 발췌)·슬라이드·자세히. export = 콘텐츠 무관 단위 테스트용.
export function PastRow({ s, onOpen }) {
  const points = Array.isArray(s['요점']) ? s['요점'] : null
  const no = String(s.회차 || '').padStart(2, '0')
  return (
    <li className="sem-row">
      <span className="sem-row-no" aria-hidden="true">{no}</span>
      <div className="sem-row-main">
        <button type="button" className="sem-row-title" onClick={() => onOpen(s.slug)}>{s.title}</button>
        <p className="sem-row-meta">{s.date} · {s.회차}회 · {s.유형}</p>
        {points ? (
          <ul className="sem-row-points">
            {points.map((p) => <li key={p}>{p}</li>)}
          </ul>
        ) : (
          <p className="sem-row-excerpt">{excerpt(splitSeminarBody(s.body).intro || s.body, 110)}</p>
        )}
        <div className="sem-row-links">
          {s['슬라이드'] && (
            <a className="btn-2nd" href={s['슬라이드']} target="_blank" rel="noreferrer">슬라이드</a>
          )}
          <button type="button" className="proof-link" onClick={() => onOpen(s.slug)}>자세히 <Arrow /></button>
        </div>
      </div>
    </li>
  )
}

// 상세 뷰 — 컬러 헤더 밴드(차콜 --dark, 화면당 다크 면 1개 + 푸터 밴드) 안에 눈썹·대형 타이틀·리드·메타·
// 액션 → 밴드 아래 흰 에디토리얼 본문(실습=목차 3앵커 + 번호 블록 01/02/03). export = 단위 테스트용.
export function SeminarDetail({ s, onBack }) {
  const isLab = s.유형 === '실습'
  const { intro, sections } = splitSeminarBody(s.body)
  const { lead, rest } = splitLead(isLab ? intro : s.body)
  return (
    <article className="sem-ed">
      <header className="sem-ed-band">
        <div className="sem-ed-band-in">
          <button type="button" className="sem-ed-back" onClick={onBack}>← 목록</button>
          <span className="sem-ed-eyebrow">{s.회차}회 · {s.유형}</span>
          <h1 className="sem-ed-title">{s.title}</h1>
          {lead && <p className="sem-ed-lead">{lead}</p>}
          <p className="sem-ed-meta">{metaLine(s)}</p>
          {(s['슬라이드'] || s.발원기사) && (
            <div className="sem-ed-actions">
              {s['슬라이드'] && <a className="btn-2nd" href={s['슬라이드']} target="_blank" rel="noreferrer">슬라이드 <Arrow /></a>}
              {s.발원기사 && <a className="sem-ed-origin" href={s.발원기사}>발원 기사 <Arrow /></a>}
            </div>
          )}
        </div>
      </header>

      <div className="sem-ed-body">
        {rest && <div className="sem-ed-intro"><Markdown body={rest} /></div>}

        {isLab && (
          <>
            <nav className="sem-ed-toc" aria-label="섹션 목차">
              {LAB_HEADINGS.map((h, i) => (
                <a className="sem-ed-toc-link" key={h} href={`#sec-${i}`}>
                  <span className="sem-ed-toc-num">{String(i + 1).padStart(2, '0')}</span>{h}
                </a>
              ))}
            </nav>
            {LAB_HEADINGS.map((h, i) => (
              <section className="sem-ed-block" id={`sec-${i}`} key={h}>
                <span className="sem-ed-num">{String(i + 1).padStart(2, '0')}</span>
                <h2 className="sem-ed-block-title">{h}</h2>
                {sections[h] ? <Markdown body={sections[h]} /> : <p className="sem-block-empty">내용 준비 중.</p>}
              </section>
            ))}
          </>
        )}
      </div>
    </article>
  )
}

export default function Seminars() {
  const all = useMemo(() => loadContent('세미나'), [])
  const today = useMemo(() => todayString(), [])
  const { upcoming, past } = useMemo(() => splitByDate(all, today), [all, today])
  const hero = upcoming[0] || null

  const paramP = () => (typeof window === 'undefined' ? null : new URLSearchParams(window.location.search).get('p'))
  const [sel, setSel] = useState(paramP)

  // 뒤로가기·앞으로가기(popstate) → URL에서 상세 슬러그 복원(뒤로가기 = 목록 복귀).
  useEffect(() => {
    const onPop = () => setSel(paramP())
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const openSeminar = useCallback((slug) => {
    if (typeof window !== 'undefined') window.history.pushState({ slug }, '', slug ? `?p=${slug}` : window.location.pathname)
    setSel(slug)
  }, [])
  const back = useCallback(() => openSeminar(null), [openSeminar])

  const cur = all.find((s) => s.slug === sel)

  if (cur) {
    return (
      <>
        <SiteNav />
        <main className="sem-main">
          <SeminarDetail s={cur} onBack={back} />
        </main>
        <SiteFooter />
      </>
    )
  }

  return (
    <>
      <SiteNav />
      <main className="sem-main">
        {hero ? <NextHero s={hero} today={today} onOpen={openSeminar} /> : <NextEmpty />}

        {past.length > 0 && (
          <section className="sem-past">
            <div className="sem-wrap">
              <h2 className="sem-past-head">지난 세미나</h2>
              <ol className="sem-log">
                {past.map((s) => <PastRow key={s.slug} s={s} onOpen={openSeminar} />)}
              </ol>
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </>
  )
}
