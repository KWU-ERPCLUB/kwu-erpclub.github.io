import { useMemo } from 'react'
import { SiteNav, SiteFooter } from '../shared.jsx'
import { loadContent } from '../content/loader.js'
import tracks from '../../data/tracks.json'

export default function Home() {
  const articles = useMemo(() => loadContent('기사').slice(0, 5), [])
  const seminarCount = useMemo(() => loadContent('세미나').length, [])
  const active = tracks.filter((t) => t.status === 'active').length
  const handedOff = tracks.filter((t) => t.handoff === '이양완료').length

  return (
    <>
      <SiteNav />
      <main className="hub-page">
        <header className="hub-head">
          <h1>KWU <em>ERP</em>연구회</h1>
          <p>경영·MIS에 AI를 접목하는 스터디 허브 — 배우는 곳이자, 각자가 AI 활용을 직접 적용하는 실습장.</p>
        </header>

        <section aria-label="스터디 현황" style={{ display: 'flex', gap: 24, margin: '8px 0 40px', flexWrap: 'wrap' }}>
          <div><strong style={{ fontSize: 28 }}>{active}</strong> <span className="hub-meta">active 트랙</span></div>
          <div><strong style={{ fontSize: 28 }}>{handedOff}</strong> <span className="hub-meta">이양완료 트랙</span></div>
          <div><strong style={{ fontSize: 28 }}>{seminarCount}</strong> <span className="hub-meta">세미나 회차 기록</span></div>
        </section>

        <h2 style={{ fontSize: 20 }}>트랙</h2>
        <ul className="hub-list" style={{ marginBottom: 40 }}>
          {tracks.map((t) => (
            <li key={t.id} className="hub-card">
              <div style={{ padding: '18px 20px', display: 'grid', gap: 6 }}>
                <span>
                  <span className="hub-card-title">{t.name}</span>{' '}
                  <span className={`hub-badge ${t.status}`}>{t.status}</span>
                </span>
                <span className="hub-meta">{t.deliverable} · {t.handoff}</span>
                {t.tool ? <a href={t.tool}>도구 열기 →</a> : <span className="hub-meta">준비</span>}
              </div>
            </li>
          ))}
        </ul>

        <h2 style={{ fontSize: 20 }}>최근 기고</h2>
        {articles.length === 0 && <p className="hub-empty">아직 기고가 없다.</p>}
        <ul className="hub-list">
          {articles.map((a) => (
            <li key={a.slug} className="hub-card">
              <a href={`/articles/?p=${a.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ padding: '16px 20px', display: 'grid', gap: 6 }}>
                  <span className="hub-card-title">{a.title}</span>
                  <span className="hub-meta">{a.date} · {a.author}</span>
                </div>
              </a>
            </li>
          ))}
        </ul>
      </main>
      <SiteFooter />
    </>
  )
}
