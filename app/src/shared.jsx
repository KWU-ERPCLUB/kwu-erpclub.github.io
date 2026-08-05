// 전 페이지 공용 — 네비게이션·푸터·화살표·링크 상수
// 탭·라벨=영문 정책(owner 2026-07-11): 현업에서 영어로 더 자주 쓰는 용어는 영문, 본문은 한글
// 모집 = /recruit/ 페이지(IA 3차 2026-07-27 — 사실 서술만·마케팅 어투 금지). 폼 기능 없음(문의 = 단톡방·GitHub).
import { useState } from 'react'
// 로그인 상태 동적 표시(M3 ④) — localStorage 동기 확인 1회. 네트워크 호출 없음 = 공개 페이지 성능·정적성 유지.
import { hasWorkspaceSession } from './data/session-flag.js'
// 연락 채널 단일원천(2026-08-05) — REPO_URL도 여기서 파생(주소 중복 0)
import { CONTACT } from './data/recruit.js'

export const REPO_URL = CONTACT.githubUrl
export const CONTRIBUTING_URL = `${REPO_URL}/blob/main/CONTRIBUTING.md`

// 탭=페이지 이동만(owner 2026-07-11 — 메인 섹션 앵커 퀵바 폐지).
// IA 4차(2026-08-05): 5종 = 메인(brand)·인사이트·세미나·프로젝트·모집 — about·log 폐지(증빙→recruit 하단,
// 운영 기록→워크스페이스 공지 탭 내부화). labs·reports·join 제거 유지. 재도입 = 오너 재승인.
const NAV_LINKS = [
  ['INSIGHTS', '/insights/'],
  ['SEMINARS', '/seminars/'],
  ['PROJECTS', '/projects/'],
  ['RECRUIT', '/recruit/'],
]

export function Arrow() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M2 12L12 2M12 2H4.5M12 2V9.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// 세션이 있을 때만 붙는 탭 — 비로그인 방문자에게는 워크스페이스 존재 자체를 노출하지 않는다.
const WORKSPACE_LINK = ['WORKSPACE', '/workspace/']

export function SiteNav({ signedIn }) {
  const [open, setOpen] = useState(false)
  // 최초 렌더 1회 판정(리렌더마다 저장소를 읽지 않는다). 테스트·SSR에서는 storage 없음 = false.
  const [hasSession] = useState(() => (signedIn === undefined ? hasWorkspaceSession() : signedIn))
  const links = hasSession ? [...NAV_LINKS, WORKSPACE_LINK] : NAV_LINKS
  // 현재 페이지의 탭 강조 (MPA — pathname 정규화 비교: /projects·/projects/index.html도 매칭)
  const isOn = (href) => {
    if (typeof window === 'undefined') return false
    const p = window.location.pathname.replace(/index\.html$/, '')
    return (p.endsWith('/') ? p : `${p}/`) === href
  }
  return (
    <header className="nav">
      <div className="nav-inner">
        <a className="brand" href="/"><em>AI</em>M</a>
        <nav className="nav-links" aria-label="사이트 섹션">
          {links.map(([label, href]) => (
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
          {links.map(([label, href]) => (
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
        <span className="f-brand">AIM — 광운대학교 ERP연구회 산하 MIS·AI 스터디</span>
        <span style={{ display: 'flex', gap: '1.25rem' }}>
          <a href={REPO_URL}>GITHUB</a>
        </span>
      </div>
    </footer>
  )
}
