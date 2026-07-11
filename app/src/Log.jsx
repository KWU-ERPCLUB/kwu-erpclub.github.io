// 내부형 페이지 1호: 운영 기록(/log/) — 디자인규칙 v2 §3(밀도)·§6(위키·운영기록 패턴) 실측용
// 역할 3차 개정(2026-07-11): 세부 페이지=내부자 활용(운영 이력·로드맵·성과 기록). 수치 대시보드 아님(adsp-board 담당)
// 내용은 확인된 사실만 기재(작업기록·저장소 기준). 추정·과장 금지
import { SiteNav, SiteFooter, REPO_URL } from './shared.jsx'

const ADSP_BOARD_URL = 'https://erpstudy.vercel.app'

const ROADMAP = [
  ['0', '허브 사이트 구축·배포 (kwu-erpclub.github.io)', 'done', '완료'],
  ['1', 'MIS·AI 스터디 1기 모집 — 스터디명·인원 확정 대기', 'prep', '모집 준비'],
  ['2', '1기 운영 — AI 활용 연구 + 결과물 제작·배포', 'planned', '예정'],
  ['3', 'SQLD 스터디', 'planned', '예정'],
  ['4', '심화 — SAP 트랙 · 공모전 출품', 'planned', '예정'],
]

// 역시간순. 배지: live=신규 / prep=개선 / planned=기록 (허브 배지 문법 재사용)
const HISTORY = [
  ['2026-07-11', [
    ['live', '신규', '운영 기록 페이지(/log) 신설 — 내부형 페이지 1호.'],
    ['prep', '개선', '사이트 역할 개정 — 메인은 소개, 세부 페이지는 내부 기록용으로. 디자인 규칙을 수치 규격(v2)으로 문서화.'],
    ['planned', '기록', 'ADsP 진도 보드 v2.3.1 릴리스(데이터 계층 정리).'],
  ]],
  ['2026-07-10', [
    ['prep', '개선', '통합 허브 개편 배포 — 메인=링크 허브, /about(계보·존재 의의)·/join(모집 안내) 신설.'],
    ['planned', '기록', '지원하기 CTA 보류 — 지원 폼 도구 미확정.'],
    ['live', '신규', '사이트 최초 배포 — GitHub 조직(KWU-ERPCLUB) + Pages, main push 자동 배포.'],
  ]],
]

const STATS = [
  ['1', '진행 중 스터디', 'ADsP 1기'],
  ['2', '라이브 실물', '진도 보드 · 이 사이트'],
  ['4', '준비·예정 트랙', 'MIS·AI · SQLD · SAP · 공모전'],
]

export default function Log() {
  return (
    <>
      <SiteNav />

      <div className="doc-wrap">
        <aside className="doc-side">
          <nav aria-label="내부 문서">
            <span className="side-label">이 페이지</span>
            <a href="#roadmap">로드맵</a>
            <a href="#history">운영 기록</a>
            <a href="#stats">성과</a>
            <span className="side-label" style={{ marginTop: '1.25rem' }}>내부 문서</span>
            <a href="/log/" className="on">운영 기록</a>
            <a href="#" aria-disabled="true">회의록 (예정)</a>
            <a href="#" aria-disabled="true">플레이북 (예정)</a>
          </nav>
        </aside>

        <main className="doc-main">
          <div className="doc-content">
            <div className="doc-meta">
              <span className="crumb"><a href="/">홈</a> / 운영 기록</span>
              <span>최종 갱신 2026-07-11</span>
              <span>담당 운영진</span>
            </div>

            <h1 className="doc-h1">운영 기록</h1>
            <p className="doc-lead">연구회가 어떻게 운영돼 왔고 어디로 가는지의 기록입니다.</p>

            <p className="callout">
              내부 운영용 페이지입니다. 연구회 소개는 <a href="/about/">소개</a>, 스터디 참여는 <a href="/join/">모집 안내</a>에서 확인하세요.
            </p>

            <section className="doc-section" id="roadmap">
              <h2 className="doc-h2">로드맵</h2>
              <table className="roadmap">
                <thead>
                  <tr><th>#</th><th>단계</th><th>상태</th></tr>
                </thead>
                <tbody>
                  {ROADMAP.map(([num, label, status, statusLabel]) => (
                    <tr key={num}>
                      <td className="td-num">{num}</td>
                      <td>{label}</td>
                      <td><span className={`status ${status}`}>{statusLabel}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            <section className="doc-section" id="history">
              <h2 className="doc-h2">운영 기록 (역시간순)</h2>
              {HISTORY.map(([date, items]) => (
                <div key={date}>
                  <span className="log-date">{date}</span>
                  {items.map(([badge, badgeLabel, text]) => (
                    <div className="log-item" key={text}>
                      <span className={`status ${badge}`}>{badgeLabel}</span>
                      <p>{text}</p>
                    </div>
                  ))}
                </div>
              ))}
            </section>

            <section className="doc-section" id="stats">
              <h2 className="doc-h2">성과</h2>
              <div className="row3" style={{ borderTop: 'none' }}>
                {STATS.map(([num, label, detail]) => (
                  <div key={label} style={{ padding: '0.5rem 0.75rem 0.75rem 0' }}>
                    <span className="stat-num">{num}</span>
                    <span className="stat-label">{label}</span>
                    <span className="stat-src">{detail}</span>
                  </div>
                ))}
              </div>
              <p className="stat-src" style={{ marginTop: '0.75rem' }}>집계 기준: KWU-ERPCLUB · adsp-board 저장소, 2026-07-11</p>
              <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
                <a className="btn-2nd" href={`${REPO_URL}/commits/main`}>전체 커밋 이력</a>
                <a className="btn-2nd" href={ADSP_BOARD_URL}>ADsP 진도 보드</a>
              </div>
            </section>
          </div>
        </main>
      </div>

      <SiteFooter />
    </>
  )
}
