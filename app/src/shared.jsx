// 전 페이지 공용 — 네비게이션·푸터·화살표·링크 상수
// 탭·라벨=영문 정책(owner 2026-07-11): 현업에서 영어로 더 자주 쓰는 용어는 영문, 본문은 한글
// 지원 기능(지원하기 CTA·지원폼)은 보류 — 2026-07-10 owner 지시
import { useState } from 'react'

export const PORTFOLIO_URL = '#' // {포폴URL} 확정 시 교체 (owner: 자리표시 유지)
export const REPO_URL = 'https://github.com/KWU-ERPCLUB/kwu-erpclub.github.io'

const NAV_LINKS = [
  ['WHY', '/#why'],
  ['ROADMAP', '/#roadmap'],
  ['PROJECTS', '/#projects'],
  ['FAQ', '/#faq'],
  ['JOIN', '/join/'],
  ['LOG', '/log/'],
]

export function Arrow() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M2 12L12 2M12 2H4.5M12 2V9.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// activeId: 메인 스크롤스파이가 현재 섹션 id를 넘기면 해당 탭이 강조된다(다른 페이지는 미지정)
export function SiteNav({ activeId }) {
  const [open, setOpen] = useState(false)
  const isOn = (href) => activeId && href === `/#${activeId}`
  return (
    <header className="nav">
      <div className="nav-inner">
        <a className="brand" href="/">KWU <em>ERP</em>연구회</a>
        <nav className="nav-links" aria-label="사이트 섹션">
          {NAV_LINKS.map(([label, href]) => (
            <a key={href} href={href} className={isOn(href) ? 'on' : undefined}>{label}</a>
          ))}
        </nav>
        <button
          type="button"
          className="nav-toggle"
          aria-label="메뉴 열기"
          aria-expanded={open}
          aria-controls="nav-mobile"
          onClick={() => setOpen(!open)}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            {open ? (
              <path d="M4 4L16 16M16 4L4 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            ) : (
              <path d="M3 5H17M3 10H17M3 15H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>
      {open && (
        <nav id="nav-mobile" className="nav-mobile" aria-label="사이트 섹션(모바일)">
          {NAV_LINKS.map(([label, href]) => (
            <a key={href} href={href} onClick={() => setOpen(false)}>{label}</a>
          ))}
        </nav>
      )}
    </header>
  )
}

export function SiteFooter() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <span className="f-brand">광운대학교 ERP연구회</span>
        <span style={{ display: 'flex', gap: '1.25rem' }}>
          <a href="/about/">ABOUT</a>
          <a href="/reports/">REPORTS</a>
          <a href={REPO_URL}>GITHUB</a>
        </span>
      </div>
    </footer>
  )
}
