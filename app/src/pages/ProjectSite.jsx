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
  { id: 'screens', label: '화면' },
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

        {/* 1 화면 — 면마다 실물 캡처 + 왜 이렇게 생겼나 */}
        <section className="ps-ch ps-ch-wash" id="screens">
          <header className="ps-ch-head ps-rv">
            <span className="ps-ch-eyebrow">SCREENS</span>
            <h2 className="ps-ch-title">면마다 왜 이렇게 생겼나</h2>
            <p className="ps-ch-lead">
              면은 있으면 좋아서 생긴 것이 아님. 막힌 것을 풀려고 하나씩 생김.
              아래는 지금 버전 실물과, 그 모습을 만든 결정.
            </p>
          </header>
          <PageShowcase />
        </section>

        {/* 2 로드맵 — 세로 지그재그. 날짜별로 어느 면이 어떻게 정합됐는지 */}
        <section className="ps-ch" id="roadmap">
          <header className="ps-ch-head ps-rv">
            <span className="ps-ch-eyebrow">ROADMAP</span>
            <h2 className="ps-ch-title">{MILESTONES.length}개의 분기</h2>
            <p className="ps-ch-lead">
              사이트의 면이 실제로 바뀐 결정만 골랐음. 각 칸은 무엇을 판단했고 AI를 어디에 썼는지까지.
              큰 점은 방향이 바뀐 자리.
            </p>
          </header>
          <RoadmapZigzag />
        </section>

        {/* 3 남은 것 + 다음 자리 */}
        <section className="ps-ch ps-ch-wash" id="next">
          <header className="ps-ch-head ps-rv">
            <span className="ps-ch-eyebrow">NEXT</span>
            <h2 className="ps-ch-title">아직 만들어가는 중</h2>
            <p className="ps-ch-lead">
              1기가 실제로 돌기 시작하는 날 정식 버전을 붙일 예정. 지금은 베타.
            </p>
          </header>
          <NextList />
          <div className="ps-cta ps-rv">
            <h3 className="ps-cta-title">이 사이트 위에서 <em>1기</em>가 굴러감</h3>
            <p>기고·세미나·모집이 전부 여기서 돌아감. 만드는 방식은 기획이 사람, 구현이 AI.</p>
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
