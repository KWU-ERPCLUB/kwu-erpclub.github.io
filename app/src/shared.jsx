// 전 페이지 공용 — 네비게이션·푸터·화살표·링크 상수
// 탭·라벨=영문 정책(owner 2026-07-11): 현업에서 영어로 더 자주 쓰는 용어는 영문, 본문은 한글
// 모집 = /recruit/ 페이지(IA 3차 2026-07-27 — 사실 서술만·마케팅 어투 금지). 문의 = 이메일·GitHub(CONTACT 상수).
import { useState } from 'react'
// 연락 채널 단일원천(2026-08-05) — REPO_URL도 여기서 파생(주소 중복 0)
import { CONTACT, CONTACT_MAILTO } from './data/recruit.js'

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

// 워크스페이스 탭 = 상시 노출(오너 개정 2026-08-07 — 세션 게이트 폐지: 링크가 없으면 로그인 화면에 갈 입구가 없다.
// 비로그인 클릭 = /workspace/ 로그인 폼이 받는다).
const WORKSPACE_LINK = ['WORKSPACE', '/workspace/']

export function SiteNav({ cta }) {
  const [open, setOpen] = useState(false)
  const links = [...NAV_LINKS, WORKSPACE_LINK]
  // 현재 페이지의 탭 강조 (MPA — pathname 정규화 비교: /projects·/projects/index.html도 매칭)
  const isOn = (href) => {
    if (typeof window === 'undefined') return false
    const p = window.location.pathname.replace(/index\.html$/, '')
    return (p.endsWith('/') ? p : `${p}/`) === href
  }
  return (
    <>
      {/* 스킵 링크 — 문서 첫 포커스 대상. 평소 화면 밖, 포커스 시에만 노출(표준 패턴). 대상 = 각 페이지 <main id="main"> */}
      <a className="skip-link" href="#main">본문 바로가기</a>
      <header className="nav">
      <div className="nav-inner">
        <a className="brand" href="/"><em>AI</em>M</a>
        <nav className="nav-links" aria-label="사이트 섹션">
          {links.map(([label, href]) => (
            <a key={href} href={href} className={isOn(href) ? 'on' : undefined}>{label}</a>
          ))}
        </nav>
        {/* 모집 CTA — 홈 한정(오너 2026-08-07: 전 페이지 노출 폐지·라벨 RECRUIT·확대+펄스 강조). cta prop = 홈만 전달 */}
        {cta && <a className="nav-cta" href="/recruit/#apply">RECRUIT</a>}
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
    </>
  )
}

// ── 페이지 헤드 골격(4차 개편 2026-08-06 — 외부 피드백 반영, 디자인규칙 §3-1) ──────
// 구 좌 라벨 레일(■ 눈썹 + --rail-w 2열) 폐지 → 중앙 정렬 1열: 소형 영문 키커 → h1 → 문장형 설명 → 메타.
// sub = "~입니다" 문장형 한 줄(페이지가 뭐 하는 곳인지 명시 — 피드백 "설명글 한 줄").
// meta = 갱신일(인사이트만 유지 — 다른 페이지는 전달하지 않으면 생략). children = 필터 탭·CTA 등.
export function PageHead({ label, title, sub, meta, children }) {
  return (
    <header className="pg-head">
      <span className="pg-label">{label}</span>
      <h1 className="pg-title">{title}</h1>
      {sub && <p className="pg-sub">{sub}</p>}
      {meta && <p className="pg-meta">{meta}</p>}
      {children}
    </header>
  )
}

// 갱신일 메타 파생(§3-1 "최종 갱신일" 의무) — 콘텐츠 레지스트리의 최신 게재일.
// 하드코딩 날짜 금지: 항목이 없거나 date가 없으면 null → 메타 줄 자체를 생략한다.
export function latestUpdated(list) {
  const d = (list || []).reduce((m, x) => {
    const v = (x && x.date ? String(x.date) : '').slice(0, 10)
    return v > m ? v : m
  }, '')
  return d ? `최종 갱신 ${d}` : null
}

// 푸터 — 전 페이지 공통, 문의 채널(이메일·GitHub) 명시(피드백 2026-08-06 "맨 밑에 이메일·문의 주소").
export function SiteFooter() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <span className="f-brand">AIM — 광운대학교 ERP연구회 산하 MIS·AI 스터디</span>
        <span className="f-links">
          <a href={CONTACT_MAILTO}>{CONTACT.email}</a>
          <a href={REPO_URL}>GITHUB</a>
        </span>
      </div>
    </footer>
  )
}
