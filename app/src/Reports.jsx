// 내부형 페이지 2호: 업계 리포트(/reports/) — "쌓아갈 그릇"(owner 2026-07-11, SPEC §2-b)
// 원천: erp-club/docs/선행조사-2026-07-10.md — 검증 통과 항목만 게재(인용 금지 목록 제외). 전 항목 출처 필수
import { SiteNav, SiteFooter } from './shared.jsx'
import DocSide from './DocSide.jsx'

// [기관·연도, 요지, 출처 URL]
const EFFECT = [
  ['MIT · Science 2023', '대졸 전문직 453명 실험 — ChatGPT 사용 시 시간 40% 단축, 품질 평가 18% 상승. 실력이 낮을수록 이득이 컸다.', 'https://www.science.org/doi/10.1126/science.adh2586'],
  ['NBER 2023', '고객상담원 5,179명 — 시간당 처리 평균 14~15% 증가, 신입·저숙련은 34% 증가. 숙련자는 효과가 미미했다.', 'https://www.nber.org/papers/w31161'],
  ['한국은행 2025', '국내 근로자 51.8%가 업무에 생성형 AI 활용(미국의 약 2배). 업무시간 단축 효과는 저경력자에게 더 컸다.', 'https://www.bok.or.kr/portal/bbs/P0002353/view.do?nttId=10093071&menuNo=200433'],
  ['METR 2025', '고숙련 오픈소스 개발자 실험 — AI 허용 시 오히려 19% 느려짐. 본인들은 빨라졌다고 믿었다(체감≠실측). 어디에 쓰는지가 성과를 가른다.', 'https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/'],
]

const GAP = [
  ['과기정통부 2026', '20대의 생성형 AI 경험률 75.3% — 전 연령 최고. 접근의 격차는 끝났다.', 'https://www.korea.kr/briefing/pressReleaseView.do?newsId=156751949'],
  ['나우앤서베이 2025', '직장인 71.3%가 AI를 쓰지만 용도 1위는 정보 검색·요약(75.3%) — 활용이 얕은 수준에 편중돼 있다.', 'https://www.nownsurvey.com/board/notice/view/wr_id/5431'],
  ['대한상의 2026', '활용률 격차의 핵심은 기업 규모가 아니라 조직 환경·프롬프트 역량이었다.', 'https://www.korcham.net/nCham/Service/Economy/appl/KcciReportDetail.asp?SEQ_NO_C010=20120944234&CHAM_CD=B001'],
  ['아주대 2026', '2026학년도 신입생부터 AI 리터러시 4과목을 교양필수로 지정 — 전공 무관 필수 역량으로 제도화가 시작됐다.', 'https://press.ajou.ac.kr/news/articleView.html?idxno=11304'],
]

const HIRING = [
  ['대한상공회의소 2025', '인사담당자 조사 — 69.2%가 채용 시 AI 역량을 고려(1위). 필요한 AI 인재 1위는 개발자가 아니라 AI 활용 기획·운영 인재(25.9%).', 'https://eiec.kdi.re.kr/policy/domesticView.do?ac=0000198300'],
  ['Microsoft·LinkedIn 2024', '글로벌 리더 71% — AI 역량 있는 저연차를, AI 역량 없는 고연차보다 먼저 뽑겠다.', 'https://news.microsoft.com/source/2024/05/08/microsoft-and-linkedin-release-the-2024-work-trend-index-on-the-state-of-ai-at-work/'],
  ['한국직업능력연구원 2026', 'AI 채용공고 20.8만 건 분석 — 최대 직무군은 개발자가 아니라 기획·설계(36.3%).', 'https://www.joongboo.com/news/articleView.html?idxno=363729579'],
]

function RepList({ items }) {
  return items.map(([org, claim, src]) => (
    <div className="rep-item" key={src}>
      <span className="rep-org">{org}</span>
      <p>{claim} <a href={src} className="rep-src">원문</a></p>
    </div>
  ))
}

export default function Reports() {
  return (
    <>
      <SiteNav />

      <div className="doc-wrap">
        <DocSide
          current="/reports/"
          sections={[['효과', '#effect'], ['격차', '#gap'], ['채용', '#hiring']]}
        />

        <main className="doc-main">
          <div className="doc-content">
            <div className="doc-meta">
              <span className="crumb"><a href="/">홈</a> / 업계 리포트</span>
              <span>최종 갱신 2026-07-11</span>
              <span>담당 운영진</span>
            </div>

            <h1 className="doc-h1">업계 리포트</h1>
            <p className="doc-lead">AI 활용의 효과·격차·채용에 대한 검증된 조사와 연구를 모읍니다. 원문을 직접 확인한 항목만 올립니다.</p>

            <p className="callout">
              스터디가 쌓아가는 근거 자료실입니다. 항목마다 원문 링크를 달고, 원문을 확인하지 못한 수치는 올리지 않습니다.
            </p>

            <section className="doc-section" id="effect">
              <h2 className="doc-h2">효과 — AI를 잘 쓰면 얼마나 달라지나</h2>
              <RepList items={EFFECT} />
            </section>

            <section className="doc-section" id="gap">
              <h2 className="doc-h2">격차 — 다들 쓰지만, 얕게 쓴다</h2>
              <RepList items={GAP} />
            </section>

            <section className="doc-section" id="hiring">
              <h2 className="doc-h2">채용 — AI 역량은 비개발 직군의 요건이 됐다</h2>
              <RepList items={HIRING} />
            </section>
          </div>
        </main>
      </div>

      <SiteFooter />
    </>
  )
}
