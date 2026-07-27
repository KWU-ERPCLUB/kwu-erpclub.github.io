import { useCallback, useEffect, useMemo, useState } from 'react'
import { SiteNav, SiteFooter, Arrow } from '../shared.jsx'
import { loadContent } from '../content/loader.js'
import { LAB_HEADINGS } from '../content/schema.js'
import { todayString, splitSeminarBody, splitLead, parseBullets, parseSources } from './seminars-logic.js'
import SeminarsTimeline from './SeminarsTimeline.jsx'
import Markdown from './Markdown.jsx'

// 일시·장소·발제자 한 줄(마이크로) — 장소는 있을 때만, 일정미정=true면 날짜 대신 '일정 미정'. 상세 밴드 메타용.
function metaLine(s) {
  const when = s['일정미정'] === true ? '일정 미정' : s.date
  return [when, s['장소'], `발제 ${s.author}`].filter(Boolean).join(' · ')
}

// "다루는 내용" 섹션 → 01~NN 번호 목차형(번호=버건디, 데스크톱 2열 grid·모바일 1열). 불릿 0개면 비표시.
function SeminarOutline({ md }) {
  const items = parseBullets(md)
  if (items.length === 0) return null
  return (
    <section className="sem-ed-outline">
      <h2 className="sem-ed-block-title">다루는 내용</h2>
      <ol className="sem-ed-outline-grid">
        {items.map((t, i) => (
          <li className="sem-ed-outline-item" key={t}>
            <span className="sem-ed-outline-num">{String(i + 1).padStart(2, '0')}</span>
            <span className="sem-ed-outline-txt">{t}</span>
          </li>
        ))}
      </ol>
    </section>
  )
}

// "출처" 섹션 → 출처 행 리스트(호버 밑줄·외부 링크 새 탭) + 말미 단서 단락 = 소형 각주. 순수 파서 주입.
function SeminarSources({ md }) {
  const { links, note } = parseSources(md)
  return (
    <section className="sem-ed-sources">
      <h2 className="sem-ed-block-title">출처</h2>
      {links.length > 0 && (
        <ul className="sem-ed-src-list">
          {links.map((l) => (
            <li key={l.url}>
              <a className="sem-ed-src-row" href={l.url} target="_blank" rel="noreferrer">{l.text}</a>
            </li>
          ))}
        </ul>
      )}
      {note && <p className="sem-ed-footnote">{note}</p>}
    </section>
  )
}

// 상세 뷰 — 다크 헤더 밴드(차콜 --dark, 화면당 다크 면 1개 + 푸터 밴드: 눈썹·대형 타이틀·리드·메타 + 발원기사 링크만,
// 슬라이드 버튼은 v3.1에서 제거 = 발표자료 진입은 목록 썸네일로 단일화) → 밴드 아래 흰 본문. 본문 3분기:
//  ① 실습(유형=실습) = 목차 3앵커 + 번호 블록(준비/진행/재현) — 기존 로직 유지(향후용)
//  ② 구조형(인지 + "다루는 내용"∨"출처" 헤딩) = 발제 블록 → 번호 목차 → 출처 리스트 특수 렌더
//  ③ 폴백(그 외 인지) = 본문 일반 마크다운. export = 단위 테스트용.
export function SeminarDetail({ s, onBack }) {
  const isLab = s.유형 === '실습'
  const { intro, sections } = splitSeminarBody(s.body)
  const hasOutline = Boolean(sections['다루는 내용'])
  const hasSources = Boolean(sections['출처'])
  const isStructured = !isLab && (hasOutline || hasSources)
  // 밴드 리드: 실습·구조형 = intro 첫 단락 / 일반 폴백 = 본문 첫 단락
  const { lead, rest } = splitLead(isLab || isStructured ? intro : s.body)
  return (
    <article className="sem-ed">
      <header className="sem-ed-band">
        <div className="sem-ed-band-in">
          <button type="button" className="sem-ed-back" onClick={onBack}>← 목록</button>
          <span className="sem-ed-eyebrow">{s.회차}회 · {s.유형}</span>
          <h1 className="sem-ed-title">{s.title}</h1>
          {lead && <p className="sem-ed-lead">{lead}</p>}
          <p className="sem-ed-meta">{metaLine(s)}</p>
          {s.발원기사 && (
            <div className="sem-ed-actions">
              <a className="sem-ed-origin" href={s.발원기사}>발원 기사 <Arrow /></a>
            </div>
          )}
        </div>
      </header>

      <div className="sem-ed-body">
        {isStructured && (
          <div className="sem-ed-byline">
            <span className="sem-ed-mono" aria-hidden="true">{(s.author || '?').charAt(0).toUpperCase()}</span>
            <span className="sem-ed-byline-txt">
              <span className="sem-ed-byline-name">발제 {s.author}</span>
              <span className="sem-ed-byline-date">{s['일정미정'] === true ? '일정 미정' : s.date}</span>
            </span>
          </div>
        )}

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

        {isStructured && (
          <>
            {hasOutline && <SeminarOutline md={sections['다루는 내용']} />}
            {hasSources && <SeminarSources md={sections['출처']} />}
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
