// 1기 로드맵 — 흐름 탭 상단 정적 섹션(2026-08-06 오너 확정).
// 원천 = workspace erp-club/docs/specs/2026-07-27-aim-운영틀.md §2(확정값만) + aim-커리큘럼-로드맵.md(멤버용 큐레이션).
// 게재 규칙: 미확정 값은 '추후 확정'으로 표기(확정처럼 쓰지 않음). 내부 설계(지표·게이트 세부)는 게재하지 않는다.

const PHASES = [
  { 구간: '모집', 기간: '08-25 ~ 09-08', 내용: '전공 무관 교내 개방 — 신청 = 공개 사이트 RECRUIT' },
  { 구간: '1차 프로젝트(개인)', 기간: '09-07 주 ~ 10-05 주 · 5회', 내용: '매주 대면 60분(요일 = 추후 확정) — 각자 반복 작업 하나를 AI로 바꾼다' },
  { 구간: '시험 휴지', 기간: '10-06 ~ 10-26', 내용: '중간고사 2주 전부터 활동 중지' },
  { 구간: '2차 프로젝트(팀)', 기간: '10-27 주 ~ 11-23 주', 내용: '팀 프로젝트 — 기획(사람) → 구현(AI 위임) → 검수. 주제 = 추후 공지' },
  { 구간: '최종 발표', 기간: '추후 확정', 내용: '기말(12-08) 전' },
]

const SESSIONS = [
  '1회 킥오프 — 개인 소재 선정 + 시작 설문',
  '2회 다섯 활용 축 개괄·체험 — 리서치 · 기획 · 구현 위임 · 자동화 · 배포',
  '3회 공통 미니과제',
  '4회 본인 소재 제작 + 상호 검수',
  '5회 중간 쇼케이스 — 발표(전·후 비교) + 허브 게재',
]

const ASK3 = [
  '그 데이터·수치, 어디서 났나',
  '만든 사람 말고, 누가 썼나',
  '뭐가 되면 실패인가',
]

export default function RoadmapSection() {
  return (
    <section className="ws-block ws-roadmap">
      <h2 className="ws-h2">1기 로드맵</h2>
      <div className="ws-tablewrap">
        <table className="ws-table">
          <thead>
            <tr><th>구간</th><th>기간</th><th>내용</th></tr>
          </thead>
          <tbody>
            {PHASES.map((p) => (
              <tr key={p.구간}><td>{p.구간}</td><td>{p.기간}</td><td>{p.내용}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
      <h3 className="ws-h3">1차 프로젝트 회차</h3>
      <ul className="ws-list">
        {SESSIONS.map((s) => <li key={s} className="ws-note" style={{ margin: 0 }}>{s}</li>)}
      </ul>
      <h3 className="ws-h3">서로 묻는 질문 3</h3>
      <ul className="ws-list">
        {ASK3.map((q) => <li key={q} className="ws-note" style={{ margin: 0 }}>{q}</li>)}
      </ul>
      <p className="ws-note">모든 공유·발표에서 듣는 사람이 묻는다 — 이 세 가지에 답이 있으면 결과물이 남는다.</p>
    </section>
  )
}
