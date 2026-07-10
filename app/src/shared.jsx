// 메인(/)·소개(/about/) 공용 — 네비게이션·푸터·화살표·링크 상수
// 지원 기능(지원하기 CTA·지원폼)은 보류 — 2026-07-10 owner 지시(전면에 내세우지 않음)
export const PORTFOLIO_URL = '#' // {포폴URL} 확정 시 교체
export const REPO_URL = 'https://github.com/KWU-ERPCLUB/kwu-erpclub.github.io'

export function Arrow() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M2 12L12 2M12 2H4.5M12 2V9.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function SiteNav() {
  return (
    <header className="nav">
      <div className="nav-inner">
        <a className="brand" href="/">KWU <em>ERP</em>연구회</a>
        <nav className="nav-links" aria-label="사이트 섹션">
          <a href="/about/">소개</a>
          <a href="/#tracks">과정</a>
          <a href="/#proof">결과물</a>
          <a href="/#join">모집</a>
        </nav>
      </div>
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
