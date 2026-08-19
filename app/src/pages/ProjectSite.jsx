// AIM 허브 사이트 — 인터랙티브 상세(/projects/site/). ADsP 상세(2026-08-13) 골격 승계.
// 구 '여정' 가로 스크롤 폐기 → 세로 지그재그 로드맵(project-site-roadmap.jsx).
// 텍스트 규칙: 개조식·경어체 금지 · 대시로 절 잇기 금지 · 내부 구현 용어 표면 금지 · 근거 없는 수치 금지.
import { useEffect } from 'react'
import { SiteNav, SiteFooter, Arrow } from '../shared.jsx'
import { useItemReveal, prefersReduced } from '../home-motion.jsx'
import {
  HeaderMeta, StackChips, HeaderLinks, HeaderStats, HeroMosaic, PageShowcase, NextList,
} from './project-site-parts.jsx'
import { RoadmapZigzag } from './project-site-roadmap.jsx'
import { META } from '../data/project-site-data.js'
import { MILESTONES } from '../data/project-site-roadmap-data.js'

const CHAPTERS = [
  { id: 'screens', label: '페이지' },
  { id: 'roadmap', label: '로드맵' },
  { id: 'next', label: '남은 것' },
]

// 챕터 스파이 — 뷰포트 중앙이 속한 챕터를 로컬 나브에 반영(ADsP 상세와 동일 문법).
function useChapterSpy() {
  useEffect(() => {
    if (prefersReduced()) return undefined
    const secs = Array.from(document.querySelectorAll('.ps-ch'))
    const links = Array.from(document.querySelectorAll('.ps-nav-links a'))
    if (secs.length === 0) return undefined
    let raf = 0
    const pick = () => {
      raf = 0
      const cy = window.innerHeight / 2
      let cur = null
      for (const s of secs) {
        const r = s.getBoundingClientRect()
        if (r.top <= cy && r.bottom > cy) cur = s.id
      }
      links.forEach((a) => a.classList.toggle('on', a.getAttribute('href') === `#${cur}`))
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(pick) }
    window.addEventListener('scroll', onScroll, { passive: true })
    pick()
    return () => { window.removeEventListener('scroll', onScroll); if (raf) cancelAnimationFrame(raf) }
  }, [])
}

export default function ProjectSite() {
  useChapterSpy()
  useItemReveal('.ps-rv')
  useEffect(() => {
    if (prefersReduced()) return undefined
    document.documentElement.classList.add('ps-js')
    return () => document.documentElement.classList.remove('ps-js')
  }, [])

  return (
    <>
      <SiteNav />
      <nav className="ps-nav" aria-label="AIM 허브 사이트 챕터">
        <div className="ps-nav-in">
          <span className="ps-nav-title">AIM 허브 사이트</span>
          <div className="ps-nav-links">
            {CHAPTERS.map((c) => <a key={c.id} href={`#${c.id}`}>{c.label}</a>)}
          </div>
        </div>
      </nav>

      <main id="main" className="ps-main">
        {/* 헤더 — 목적 1줄 + 제작 정보 + 스택 + 상태 + 링크 */}
        <header className="ps-hero">
          <span className="ps-hero-label">PROJECT</span>
          <h1 className="ps-hero-title">AIM <em>허브 사이트</em></h1>
          <p className="ps-hero-purpose">{META.purpose}</p>
          <HeaderMeta />
          <StackChips />
          <HeaderLinks />
          <HeaderStats />
          <HeroMosaic />
        </header>

        {/* 1 페이지 — 페이지마다 실물 캡처 + 왜 이렇게 만들었나 */}
        <section className="ps-ch ps-ch-wash" id="screens">
          <header className="ps-ch-head ps-rv">
            <span className="ps-ch-eyebrow">PAGES</span>
            <h2 className="ps-ch-title">각 페이지를 왜 이렇게 만들었나</h2>
            <p className="ps-ch-lead">
              페이지는 필요할 때마다 하나씩 늘었다.
              지금 버전의 실제 화면과 함께, 그렇게 만든 이유를 페이지별로 정리했다.
            </p>
          </header>
          <PageShowcase />
        </section>

        {/* 2 로드맵 — 세로 지그재그. 날짜별로 어느 페이지가 어떻게 바뀌었는지 */}
        <section className="ps-ch" id="roadmap">
          <header className="ps-ch-head ps-rv">
            <span className="ps-ch-eyebrow">ROADMAP</span>
            <h2 className="ps-ch-title">만들면서 내린 결정 {MILESTONES.length}개</h2>
            <p className="ps-ch-lead">
              화면이 실제로 바뀐 결정만 골라 시간순으로 적었다.
              각 항목에는 무엇을 판단했고 AI를 어디에 썼는지를 담았다. 큰 점은 방향이 바뀐 지점이다.
            </p>
          </header>
          <RoadmapZigzag />
        </section>

        {/* 3 남은 것 + 다음 자리 */}
        <section className="ps-ch ps-ch-wash" id="next">
          <header className="ps-ch-head ps-rv">
            <span className="ps-ch-eyebrow">NEXT</span>
            <h2 className="ps-ch-title">아직 만들어가는 중이다</h2>
            <p className="ps-ch-lead">
              1기가 실제로 시작되는 날 정식 버전을 붙일 예정이다. 지금은 베타다.
            </p>
          </header>
          <NextList />
          <div className="ps-cta ps-rv">
            <h3 className="ps-cta-title">이 사이트에서 <em>AIM 1기</em>가 진행된다</h3>
            <p>기고, 세미나, 모집이 전부 여기서 이뤄진다. 기획은 사람이, 구현은 AI가 맡았다.</p>
            <div className="ps-cta-row">
              <a className="btn-dark" href="/recruit/">AIM 1기 모집 보기 <Arrow /></a>
              <a className="btn-2nd" href="/projects/">다른 프로젝트 <Arrow /></a>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
