import { useCallback, useEffect, useMemo, useState } from 'react'
import { SiteNav, SiteFooter, Arrow } from '../shared.jsx'
import { loadContent } from '../content/loader.js'
import { LAB_HEADINGS } from '../content/schema.js'
import { authorName } from '../content/authors.js'
import { todayString, splitSeminarBody, splitLead, splitFirstSentence, parseBullets, parseSources } from './seminars-logic.js'
import { splitTitle } from './insights-logic.js'
import SeminarsTimeline from './SeminarsTimeline.jsx'
import Markdown from './Markdown.jsx'

// 일시·장소·발제자 한 줄(마이크로) — 장소는 있을 때만, 일정미정=true면 날짜 대신 '일정 미정'. 상세 밴드 메타용.
function metaLine(s) {
  const when = s['일정미정'] === true ? '일정 미정' : s.date
  return [when, s['장소'], `발제 ${authorName(s.author)}`].filter(Boolean).join(' · ')
}

// 핵심 카드(2026-08-15 오너: "서식이 거의 없고 텍스트가 너무 많아 핵심이 한 번에 안 보인다").
// 원천 = frontmatter `요점`(이미 있는 데이터 — 신조 0). 목록에서 쓰던 것을 상세 맨 위로 올려
// 긴 리드 문단 대신 이 카드가 먼저 읽히게 한다. 대시 절은 줄바꿈(뒷절 = 톤 한 단계 낮춤).
function SeminarKeys({ points }) {
  if (!points || points.length === 0) return null
  return (
    <ul className="sem-ed-keys" aria-label="이 회차의 핵심">
      {points.map((p, i) => (
        <li className="sem-ed-key" key={p}>
          <span className="sem-ed-key-n">{String(i + 1).padStart(2, '0')}</span>
          <span className="sem-ed-key-t">
            {splitTitle(p).map((line, j) => (
              <span className={j ? 'sem-ed-key-sub' : 'sem-ed-key-main'} key={line}>{line}</span>
            ))}
          </span>
        </li>
      ))}
    </ul>
  )
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
  const thumbs = Array.isArray(s['썸네일']) ? s['썸네일'].filter(Boolean) : []
  const pdfHref = s.pdf || s['슬라이드']
  const { intro, sections } = splitSeminarBody(s.body)
  const hasOutline = Boolean(sections['다루는 내용'])
  const hasSources = Boolean(sections['출처'])
  const isStructured = !isLab && (hasOutline || hasSources)
  // 밴드 리드: 실습·구조형 = intro 첫 단락 / 일반 폴백 = 본문 첫 단락
  const { lead, rest } = splitLead(isLab || isStructured ? intro : s.body)
  // 헤더 리드 = 첫 문장만(2026-08-15 오너) — 남은 문장은 본문 맨 앞으로 내려보낸다.
  const { first: leadFirst, rest: leadRest } = splitFirstSentence(lead)
  const intro2 = [leadRest, rest].filter(Boolean).join('\n\n')
  const points = Array.isArray(s['요점']) ? s['요점'].filter(Boolean) : []
  return (
    <article className="sem-ed">
      <header className="sem-ed-band">
        <div className="sem-ed-band-in">
          <button type="button" className="sem-ed-back" onClick={onBack}>← 목록</button>
          <span className="sem-ed-eyebrow">{s.회차}회 · {s.유형}</span>
          {/* 제목 = 대시 폐지·의미 단위 줄바꿈(2026-08-15) */}
          <h1 className="sem-ed-title">
            {splitTitle(s.title).map((line, i) => (
              <span className={i ? 'sem-ed-title-sub' : 'sem-ed-title-main'} key={line}>{line}</span>
            ))}
          </h1>
          {leadFirst && <p className="sem-ed-lead">{leadFirst}</p>}
          <p className="sem-ed-meta">{metaLine(s)}</p>
          {(s.발원기사 || s.pdf) && (
            <div className="sem-ed-actions">
              {s.발원기사 && <a className="sem-ed-origin" href={s.발원기사}>발원 기사 <Arrow /></a>}
              {s.pdf && <a className="sem-ed-origin" href={s.pdf} download>PDF 받기 <Arrow /></a>}
            </div>
          )}
        </div>
      </header>

      <div className="sem-ed-body">
        {/* 핵심 카드 = 본문 맨 앞(오너 2026-08-15) — 텍스트 벽 앞에 요점부터 눈에 들어오게 */}
        <SeminarKeys points={points} />

        {pdfHref && thumbs.length > 0 && (
          <a className="sem-ed-cover" href={pdfHref} target="_blank" rel="noreferrer" aria-label={s.pdf ? '발표자료 PDF 열기' : '슬라이드 열기'}>
            <img src={thumbs[0]} alt={`${s.title} 발표자료 표지`} />
            <span className="sem-ed-cover-note">{s.pdf ? '클릭 = 발표자료 PDF 새 탭 열기' : '클릭 = 슬라이드 새 탭 열기'}</span>
          </a>
        )}

        {isStructured && (
          <div className="sem-ed-byline">
            <span className="sem-ed-mono" aria-hidden="true">{(authorName(s.author) || '?').charAt(0).toUpperCase()}</span>
            <span className="sem-ed-byline-txt">
              <span className="sem-ed-byline-name">발제 {authorName(s.author)}</span>
              <span className="sem-ed-byline-date">{s['일정미정'] === true ? '일정 미정' : s.date}</span>
            </span>
          </div>
        )}

        {intro2 && <div className="sem-ed-intro"><Markdown body={intro2} /></div>}

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
        <main id="main" className="sem-main">
          <SeminarDetail s={cur} onBack={back} />
        </main>
        <SiteFooter />
      </>
    )
  }

  return (
    <>
      <SiteNav />
      <main id="main" className="sem-main">
        <div className="sem-list">
          <SeminarsTimeline all={all} today={today} onOpen={openSeminar} />
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
