// 문안 원천: erp-club/docs/문안-메인.md (2차) — 자리표시: {스터디명}·{지원폼URL}·{포폴URL}
const FORM_URL = '#' // {지원폼URL} 확정 시 교체
const PORTFOLIO_URL = '#' // {포폴URL} 확정 시 교체

const STATS = [
  { num: '62.8%', label: '500대 기업 중 하반기 대졸 채용 계획 없음·미정', src: '한국경제인협회 2025' },
  { num: '81.6%', label: '신입 채용 1순위 평가요소 = 직무 경험', src: '한국경영자총협회 2025' },
  { num: '69.2%', label: '채용 시 AI 역량 고려 · 원하는 인재 1위는 기획·운영', src: '대한상공회의소 2025' },
]

const TRACKS = [
  { title: '포트폴리오 제작·배포', desc: 'AI와 함께 각자 포트폴리오 사이트를 만들어 무료 스택으로 배포합니다.' },
  { title: 'git 협업', desc: '버전 관리와 코드 리뷰를 현업 방식 그대로 사용합니다.' },
  { title: '경영 문제 프로젝트', desc: '기본기를 갖춘 뒤 실제 경영 문제 하나를 시스템으로 풉니다. 공모전·SAP 트랙으로 연결됩니다.', invert: true },
]

export default function App() {
  return (
    <main>
      <section className="section" id="hero">
        <span className="eyebrow">광운대학교 ERP연구회</span>
        <h1 className="headline"><em>포트폴리오</em>를 만들어 배포하는 스터디</h1>
        <div className="chips" style={{ marginBottom: '2rem' }}>
          <span className="chip">경영학부 대상</span>
          <span className="chip">코딩 경험 불필요</span>
          <span className="chip">비용 0원</span>
        </div>
        <a className="btn" href={FORM_URL}>지원하기</a>
      </section>

      <section className="section" id="why">
        <span className="eyebrow">왜 지금인가</span>
        <h2 className="headline">2025년, 세 개의 <em>조사</em></h2>
        <div className="grid">
          {STATS.map((s) => (
            <div className="card stat" key={s.num}>
              <span className="num">{s.num}</span>
              <p>{s.label}</p>
              <span className="src">{s.src}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="section" id="tracks">
        <span className="eyebrow">한 학기 과정</span>
        <h2 className="headline">세 가지를 <em>합니다</em></h2>
        <div className="grid">
          {TRACKS.map((t) => (
            <div className={t.invert ? 'card card--invert' : 'card'} key={t.title}>
              <h3>{t.title}</h3>
              <p>{t.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section" id="proof">
        <span className="eyebrow">결과물</span>
        <h2 className="headline">같은 방식으로 만든 <em>두 개</em></h2>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
          <div className="card">
            <h3>운영자 포트폴리오</h3>
            <p>이 스터디에서 만들게 될 것의 원형입니다.</p>
            <p style={{ marginTop: '0.75rem' }}><a href={PORTFOLIO_URL}>보기</a></p>
          </div>
          <div className="card">
            <h3>이 사이트</h3>
            <p>이 페이지도 같은 방식(AI 협업 · git · 무료 배포)으로 제작했습니다.</p>
          </div>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-sub)', marginTop: '1.5rem' }}>
          운영 — 신해원 · 광운대 경영학부 · LG CNS AM Inspire Camp 6기 선발(고용노동부 K-디지털 트레이닝)
        </p>
      </section>

      <section className="section" id="join">
        {/* {스터디명} 확정 시 헤드라인에 반영 */}
        <h2 className="headline">1기 <em>모집</em></h2>
        <div className="chips" style={{ marginBottom: '2rem' }}>
          <span className="chip">모집 인원 미정</span>
          <span className="chip">노트북 지참</span>
        </div>
        <a className="btn" href={FORM_URL}>지원하기</a>
      </section>

      <footer className="footer">광운대학교 ERP연구회</footer>
    </main>
  )
}
