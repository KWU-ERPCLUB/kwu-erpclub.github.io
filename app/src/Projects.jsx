// 외부 공개 페이지: 프로젝트(/projects/) — v3.1 NEXTERS 실측 문법(2026-08-05, 디자인규칙 §6-2a):
// B2 좌 고정 라벨 컬럼(버건디 ■+PROJECTS, 폰=상하 적층) + B1 블랙 통계 밴드(실측 수치만·출처 각주)
// + N4 쇼케이스 카드(1열 대형 커버 — 카드 2장 현실에서 캐러셀은 억지라 기각, 대형 커버 우선).
// 유지 = 목록 쇼케이스·호버 오버레이(GitHub·Web)·구 ?p= 딥링크. 데이터 = content/프로젝트/ 로더.
// 2026-08-20: md 본문 상세(ProjectDetail·splitProjectBody) 폐지 — 전 프로젝트가 전용 인터랙티브 페이지로 이동해
// 본문 렌더 경로가 죽은 코드로 남아 있었다. md는 목록 카드 메타(frontmatter + 3줄)만 담는다.
import { useCallback, useEffect, useMemo } from 'react'
import { Arrow, SiteNav, SiteFooter, PageHead } from './shared.jsx'
import { loadContent } from './content/loader.js'

// 상태 칩 클래스 매핑(global.css .status 재사용 — 버건디 면 금지 준수).
const STATUS_CLASS = { '운영 중': 'live', '진행 중': 'prep', '보관': 'planned' }

// 인터랙티브 전용 페이지로 승격된 프로젝트(파일럿 — spec 2026-08-12). 카드·구 ?p= 딥링크 = 새 페이지로.
// md 원문은 콘텐츠 계약·DB 검증 대상으로 보존(목록 카드 메타의 원천).
export const INTERACTIVE_PAGES = {
  '2026-07-24-bapzzi-adsp-board': '/projects/adsp/',
  '2026-07-24-bapzzi-erpclub-site': '/projects/site/',
}

function initial(s) {
  return (s || '?').trim().charAt(0).toUpperCase()
}

// 커버 배너 — 이미지 있으면 커버, 없으면 이니셜 타일 fallback.
function Cover({ p, className }) {
  if (p['커버']) return <img className={className} src={p['커버']} alt="" loading="lazy" />
  return <span className={`${className} pj-cover-fallback`} aria-hidden="true">{initial(p.title)}</span>
}

// 프로젝트 링크 버튼들(frontmatter에 있는 것만). variant = overlay(흰 필)/detail(Secondary).
function ProjectLinks({ p, variant }) {
  const cls = variant === 'overlay' ? 'pj-ov-link' : 'btn-2nd'
  return (
    <>
      {p.github && (
        <a className={cls} href={p.github} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
          GitHub <Arrow />
        </a>
      )}
      {p.web && (
        <a className={cls} href={p.web} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
          Web <Arrow />
        </a>
      )}
    </>
  )
}

// (구 ProjectStats 블랙 통계 밴드 = 4차 개편 2026-08-06 삭제 — 피드백 "홈 내용이라 없어도 될 것 같다".
//  홈 블랙 밴드(StatsBand)가 실측 수치를 담당한다. 재도입 = 오너 재승인.)

// 쇼케이스 카드 — 대형 커버 + 호버 오버레이(링크) + 번호·제목·설명·상태. export = 단위 테스트용.
export function ProjectCard({ p, idx, onOpen }) {
  const hasLinks = Boolean(p.github || p.web)
  return (
    <article className="pj-card">
      <div className="pj-card-coverwrap">
        <button type="button" className="pj-card-open" onClick={() => onOpen(p.slug)} aria-label={`${p.title} 상세`}>
          <Cover p={p} className="pj-card-cover" />
        </button>
        {hasLinks && (
          <div className="pj-card-overlay" aria-hidden="false">
            <ProjectLinks p={p} variant="overlay" />
          </div>
        )}
      </div>
      <button type="button" className="pj-card-info" onClick={() => onOpen(p.slug)}>
        {typeof idx === 'number' && <span className="pj-card-idx">{String(idx + 1).padStart(2, '0')}</span>}
        <span className="pj-card-title">{p.title}</span>
        <span className="pj-card-desc">{p['설명']}</span>
        <span className={`status ${STATUS_CLASS[p['상태']] || 'planned'}`}>{p['상태']}</span>
      </button>
    </article>
  )
}

// 목록 — 쇼케이스 1열(대형 커버). export = 단위 테스트용.
export function ProjectGrid({ list, onOpen }) {
  if (list.length === 0) {
    return (
      <div className="hub-empty hub-empty-how">
        <p className="hub-empty-title">등재된 프로젝트 아직 없음.</p>
        <p>스터디의 프로젝트·활동 기록이 여기 쌓임 — 배포물이 아니어도 됨. 커버 캡처 + 한 줄 설명 + 상태.</p>
        <p>기고 = 워크스페이스 &gt; 인사이트 기고 탭(스터디원).</p>
      </div>
    )
  }
  return (
    <div className="pj-grid">
      {list.map((p, i) => <ProjectCard key={p.slug} p={p} idx={i} onOpen={onOpen} />)}
    </div>
  )
}

export default function Projects() {
  const all = useMemo(() => loadContent('프로젝트'), [])

  // 카드 클릭 = 전용 상세 페이지로 이동. 전용 페이지가 없는 프로젝트는 이동하지 않는다(md 본문 상세 폐지).
  const open = useCallback((slug) => {
    if (slug && INTERACTIVE_PAGES[slug]) window.location.href = INTERACTIVE_PAGES[slug]
  }, [])

  // 구 ?p= 딥링크(공유·북마크) = 전용 페이지로 리다이렉트(URL 유지 처치)
  useEffect(() => {
    const slug = new URLSearchParams(window.location.search).get('p')
    if (slug && INTERACTIVE_PAGES[slug]) window.location.replace(INTERACTIVE_PAGES[slug])
  }, [])

  // 골격(4차 2026-08-06) = 공용 PageHead(중앙) → 쇼케이스 2열 그리드(스탯 밴드 삭제).
  return (
    <>
      <SiteNav />
      <main id="main" className="hub-page pj-page">
        {/* 설명 줄 = 오너 삭제 2026-08-15(대시로 이어붙인 부연 폐지) */}
        <PageHead label="PROJECTS" title={<em>프로젝트</em>} />
        <ProjectGrid list={all} onOpen={open} />
      </main>
      <SiteFooter />
    </>
  )
}
