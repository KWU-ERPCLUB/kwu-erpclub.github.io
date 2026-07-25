// /log 2차 구조 개혁(2026-07-25): 내부형 doc 셸(DocSide 사이드바·breadcrumb) 폐지 → linear.app 체인지로그 톤 풀블리드.
// 좌 = 대형 날짜 마커(세로 라인·점) / 우 = 엔트리(유형 배지 + 제목 볼드 + 개조식 설명). 역시간순.
// 로드맵 = 대형 리스트(단계 번호 + 상태 칩 4종 + 설명). 성과 = 스탯 스트립. 기록 사실 그대로 이관 — 신규 날조 금지.
import { SiteNav, SiteFooter, REPO_URL } from './shared.jsx'

const ADSP_BOARD_URL = 'https://erpstudy.vercel.app'

const ROADMAP = [
  ['0', '허브 사이트 구축·배포 (kwu-erpclub.github.io)', 'done', '완료'],
  ['1', 'MIS·AI 스터디 1기 모집 — 스터디명·인원 확정 대기', 'prep', '모집 준비'],
  ['2', '1기 운영 — AI 활용 연구 + 하위 프로젝트 실전', 'planned', '예정'],
  ['3', 'SQLD 스터디', 'planned', '예정'],
  ['4', '심화 — SAP 트랙 · 공모전 출품', 'planned', '예정'],
]

// 역시간순. 배지: live=신규 / prep=개선 / planned=기록 (허브 배지 문법 재사용). 사실 그대로.
const HISTORY = [
  ['2026-07-11', [
    ['live', '신규', '운영 기록 페이지(/log) 신설 — 내부형 페이지 1호.'],
    ['prep', '개선', '사이트 역할 개정 — 메인은 소개, 세부 페이지는 내부 기록용으로. 디자인 규칙을 수치 규격(v2)으로 문서화.'],
    ['planned', '기록', 'ADsP 진도 보드 v2.3.1 릴리스(데이터 계층 정리).'],
  ]],
  ['2026-07-10', [
    ['prep', '개선', '통합 허브 개편 배포 — 메인=링크 허브, /about(계보·존재 의의)·/join(모집 안내) 신설.'],
    ['planned', '기록', '참여 안내 방식 보류 — 안내 도구 미확정.'],
    ['live', '신규', '사이트 최초 배포 — GitHub 조직(KWU-ERPCLUB) + Pages, main push 자동 배포.'],
  ]],
]

const STATS = [
  ['1', '진행 중 스터디', 'ADsP 1기'],
  ['2', '라이브 실물', '진도 보드 · 이 사이트'],
  ['4', '준비·예정 트랙', 'MIS·AI · SQLD · SAP · 공모전'],
]

// 기존 기록 텍스트를 '제목 — 설명' 경계(' — ')로 분리(날조 없음 — 원문 그대로 쪼갬). 경계 없으면 전체가 제목.
export function splitEntry(text) {
  const t = (text || '').trim()
  const i = t.indexOf(' — ')
  if (i === -1) return { title: t, desc: '' }
  return { title: t.slice(0, i).trim(), desc: t.slice(i + 3).trim() }
}

// 최종 갱신 = 데이터의 실제 최신 날짜(하드코딩 금지 — HISTORY 최상단에서 파생).
const lastUpdated = HISTORY[0][0]

// 세로 타임라인 체인지로그(날짜 그룹). export = 콘텐츠·시점 무관 구조 테스트용.
export function Changelog({ history }) {
  return (
    <ol className="cl-timeline">
      {history.map(([date, items]) => (
        <li className="cl-group" key={date}>
          <span className="cl-date">{date}</span>
          <div className="cl-entries">
            {items.map(([badge, badgeLabel, text]) => {
              const { title, desc } = splitEntry(text)
              return (
                <div className="cl-entry" key={text}>
                  <div className="cl-entry-top">
                    <span className={`status ${badge}`}>{badgeLabel}</span>
                    <h3 className="cl-title">{title}</h3>
                  </div>
                  {desc && <p className="cl-desc">{desc}</p>}
                </div>
              )
            })}
          </div>
        </li>
      ))}
    </ol>
  )
}

export default function Log() {
  return (
    <>
      <SiteNav />

      <main className="log-main">
        <header className="log-head">
          <div className="log-head-in">
            <span className="log-eyebrow">LOG</span>
            <h1 className="log-h1">연구회 <em>운영 기록</em></h1>
            <p className="log-lead">연구회가 어떻게 운영돼 왔고 어디로 가는지의 기록.</p>
            <p className="log-meta">최종 갱신 {lastUpdated} · 담당 운영진</p>
          </div>
        </header>

        <section className="log-timeline-sec" aria-labelledby="log-history">
          <div className="log-band-in">
            <p className="log-callout">
              내부 운영용 페이지. 연구회 소개·참여 문의 = <a href="/about/">ABOUT</a>.
            </p>
            <span className="log-kicker" id="log-history">CHANGELOG · 역시간순</span>
            <Changelog history={HISTORY} />
          </div>
        </section>

        <section className="log-roadmap-sec" aria-labelledby="log-roadmap">
          <div className="log-band-in">
            <span className="log-kicker">ROADMAP</span>
            <h2 className="log-h2" id="log-roadmap">앞으로의 단계</h2>
            <ol className="rmap-list">
              {ROADMAP.map(([num, label, status, statusLabel]) => (
                <li className="rmap-row" key={num}>
                  <span className="rmap-no">{num}</span>
                  <div className="rmap-body">
                    <span className={`status ${status}`}>{statusLabel}</span>
                    <p className="rmap-label">{label}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="log-proof-sec" aria-labelledby="log-stats">
          <div className="log-band-in">
            <span className="log-kicker">현황</span>
            <h2 className="log-h2" id="log-stats">성과</h2>
            <div className="log-stats">
              {STATS.map(([num, label, detail]) => (
                <div className="log-stat" key={label}>
                  <span className="stat-num">{num}</span>
                  <span className="stat-label">{label}</span>
                  <span className="stat-src">{detail}</span>
                </div>
              ))}
            </div>
            <p className="log-basis">집계 기준: KWU-ERPCLUB · adsp-board 저장소, 2026-07-11</p>
            <div className="log-actions">
              <a className="btn-2nd" href={`${REPO_URL}/commits/main`}>전체 커밋 이력</a>
              <a className="btn-2nd" href={ADSP_BOARD_URL}>ADsP 진도 보드</a>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  )
}
