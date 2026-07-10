// 메인(/)·소개(/about/) 공용 — 네비게이션·푸터·화살표·링크 상수
// 지원 기능(지원하기 CTA·지원폼)은 보류 — 2026-07-10 owner 지시(전면에 내세우지 않음)
import { useState } from 'react'

export const PORTFOLIO_URL = '#' // {포폴URL} 확정 시 교체
export const REPO_URL = 'https://github.com/KWU-ERPCLUB/kwu-erpclub.github.io'

const NAV_LINKS = [
  ['소개', '/about/'],
  ['과정', '/#tracks'],
  ['결과물', '/#proof'],
  ['모집', '/#join'],
]

export function Arrow() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M2 12L12 2M12 2H4.5M12 2V9.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function SiteNav() {
  const [open, setOpen] = useState(false)
  return (
    <header className="nav">
      <div className="nav-inner">
        <a className="brand" href="/">KWU <em>ERP</em>연구회</a>
        <nav className="nav-links" aria-label="사이트 섹션">
          {NAV_LINKS.map(([label, href]) => (
            <a key={href} href={href}>{label}</a>
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
        <a href={REPO_URL}>GitHub</a>
      </div>
    </footer>
  )
}
