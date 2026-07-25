import { useCallback, useEffect, useMemo, useState } from 'react'
import { SiteNav, SiteFooter, Arrow } from '../shared.jsx'
import { loadContent } from '../content/loader.js'
import { LAB_HEADINGS } from '../content/schema.js'
import { todayString, splitSeminarBody, splitLead } from './seminars-logic.js'
import SeminarsTimeline from './SeminarsTimeline.jsx'
import Markdown from './Markdown.jsx'

// 일시·장소·발제자 한 줄(마이크로) — 장소는 있을 때만. 상세 밴드 메타용.
function metaLine(s) {
  return [s.date, s['장소'], `발제 ${s.author}`].filter(Boolean).join(' · ')
}

// 상세 뷰(v3 변경 없음) — 컬러 헤더 밴드(차콜 --dark, 화면당 다크 면 1개 + 푸터 밴드) 안에 눈썹·대형 타이틀·
// 리드·메타·액션 → 밴드 아래 흰 에디토리얼 본문(실습=목차 3앵커 + 번호 블록 01/02/03). export = 단위 테스트용.
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

  const paramP = () => (typeof window === 'undefined' ? null : new URLSearchParams(window.location.search).get('p'))
  const [sel, setSel] = useState(paramP)

  // 뒤로가기·앞으로가기(popstate) → URL에서 상세 슬러그 복원(뒤로가기 = 목록 복귀). 상세만 URL 반영(?p=).
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
        <div className="sem-list">
          <SeminarsTimeline all={all} today={today} onOpen={openSeminar} />
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
