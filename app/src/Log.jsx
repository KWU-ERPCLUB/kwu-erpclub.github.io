// /log 2차 구조 개혁(2026-07-25): 내부형 doc 셸(DocSide 사이드바·breadcrumb) 폐지 → linear.app 체인지로그 톤 풀블리드.
// 좌 = 대형 날짜 마커(세로 라인·점) / 우 = 엔트리(유형 배지 + 제목 볼드 + 개조식 설명). 역시간순.
// 로드맵 = 대형 리스트(단계 번호 + 상태 칩 4종 + 설명). 성과 = 스탯 스트립. 기록 사실 그대로 이관 — 신규 날조 금지.
// 데이터(로드맵·체인지로그·성과) = src/data/log.js — 이 파일은 렌더만 한다(기록 추가 = 데이터 1줄 추가).
import { SiteNav, SiteFooter, REPO_URL } from './shared.jsx'
import { ROADMAP, HISTORY, STATS, STATS_BASIS, ADSP_BOARD_URL } from './data/log.js'

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
            <p className="log-basis">{STATS_BASIS}</p>
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
