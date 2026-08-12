// ADsP 스터디 1기 — 인터랙티브 상세(파일럿). spec = erp-club/docs/specs/2026-08-12-adsp-인터랙티브-개편.md
// 서사(오너 픽 2026-08-13) = 계기 → MVP → 첫 반복 → 구조 → 정착 → 품질 → 운영 → 실전 → 마감.
// 텍스트 규칙: 챕터당 문단 ≤2·핵심구만 볼드·keep-all. 수치 = data/project-adsp-data.js 단일원천.
import { useEffect } from 'react'
import { SiteNav, SiteFooter, Arrow } from '../shared.jsx'
import { CountUp, useItemReveal, prefersReduced } from '../home-motion.jsx'
import { WeeklyChart, MetricTabs, ToolCarousel } from './project-adsp-parts.jsx'
import { HERO_STATS, MINOR_ITEMS, CHAPTERS, BOARD_URL } from '../data/project-adsp-data.js'

// 챕터 스파이 — 뷰포트 중앙이 속한 챕터를 로컬 나브에 반영(recruit useRoadmapFlow 문법).
function useChapterSpy() {
  useEffect(() => {
    if (prefersReduced()) return undefined
    const secs = Array.from(document.querySelectorAll('.pa-ch'))
    const links = Array.from(document.querySelectorAll('.pa-nav-links a'))
    if (secs.length === 0) return undefined
    let raf = 0
    const pick = () => {
      raf = 0
      const cy = window.innerHeight / 2
      let cur = null
      for (const s of secs) {
        const r = s.getBoundingClientRect()
        if (r.top <= cy && r.bottom > cy) cur = s.id
      }
      links.forEach((a) => a.classList.toggle('on', a.getAttribute('href') === `#${cur}`))
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(pick) }
    window.addEventListener('scroll', onScroll, { passive: true })
    pick()
    return () => { window.removeEventListener('scroll', onScroll); if (raf) cancelAnimationFrame(raf) }
  }, [])
}

// 챕터 헤드 — 날짜 눈썹 + 결정문.
function ChapterHead({ date, title }) {
  return (
    <header className="pa-ch-head pa-rv">
      <span className="pa-ch-date">{date}</span>
      <h2 className="pa-ch-title">{title}</h2>
    </header>
  )
}

// 결정 카드 — 문제 → 결정 → 결과 3칸(집중 조명 포인트의 공통 골격).
function Decision({ problem, decision, result }) {
  return (
    <div className="pa-dgrid pa-rv">
      <div className="pa-dcell"><span className="pa-dcell-label">문제</span><p>{problem}</p></div>
      <div className="pa-dcell main"><span className="pa-dcell-label">결정</span><p>{decision}</p></div>
      <div className="pa-dcell"><span className="pa-dcell-label">결과</span><p>{result}</p></div>
    </div>
  )
}

export default function ProjectAdsp() {
  useChapterSpy()
  useItemReveal('.pa-rv')
  useEffect(() => {
    if (prefersReduced()) return undefined
    document.documentElement.classList.add('pa-js')
    return () => document.documentElement.classList.remove('pa-js')
  }, [])
  return (
    <>
      <SiteNav />
      <nav className="pa-nav" aria-label="ADsP 1기 챕터">
        <div className="pa-nav-in">
          <span className="pa-nav-title">ADsP 스터디 1기</span>
          <div className="pa-nav-links">
            {CHAPTERS.map((c) => <a key={c.id} href={`#${c.id}`}>{c.label}</a>)}
          </div>
          <a className="pa-nav-cta" href={BOARD_URL} target="_blank" rel="noreferrer">보드 보기</a>
        </div>
      </nav>

      <main id="main" className="pa-main">
        {/* 히어로 — 만들게 된 계기가 첫 문장 */}
        <section className="pa-hero">
          <span className="pa-hero-label">PROJECT · 2026-06-26 ~ 08-08</span>
          <h1 className="pa-hero-title">흩어진 공부를 <em>한 화면</em>에.</h1>
          <p className="pa-hero-sub">
            온라인 스터디 8명의 공부량과 스타일은 제각각이었습니다. 진행을 한눈에 보고
            자료·퀴즈·기출까지 한곳에서 해결하는 학습 대시보드를 만들어 6주를 운영한 기록입니다.
          </p>
          <div className="pa-hero-stats">
            {HERO_STATS.map((s) => (
              <div className="pa-hstat" key={s.label}>
                <CountUp value={s.value} />
                <span className="pa-hstat-label">{s.label}</span>
                <span className="pa-hstat-src">{s.src}</span>
              </div>
            ))}
          </div>
          <img className="pa-hero-shot pa-rv" src="/img/projects/adsp/home-now.png"
            alt="ADsP 진도 보드 대시보드 실측 화면" />
        </section>

        {/* 1 시작 — MVP 범위 결정 */}
        <section className="pa-ch pa-ch-wash" id="start">
          <ChapterHead date="06-26 ~ 06-28" title="첫 판에는 두 가지만 담았다." />
          <p className="pa-lead pa-center pa-rv">
            매주 진도를 사람 손으로 걷는 대신 웹앱을 만들기로 했다. 전부 만들고 시작하는 대신
            <strong> 진도 체크와 현황판만 담은 MVP를 이틀 만에 배포</strong>하고,
            나머지는 전부 뒤로 미뤘다. 가입 절차도 뺐다 — 이름+PIN 입장. 8명에게
            가입을 요구하면 그 자체가 이탈 지점이 된다.
          </p>
          <Decision
            problem="진도·성취도 집계를 매주 수기로 걷어야 했다"
            decision="진도 체크 + 현황판, 두 기능만 당일 배포"
            result="배포 첫날부터 실사용 — 이후 6주 내내 피드백으로 증보" />
        </section>

        {/* 2 반복 — v1.0 → v1.1 */}
        <section className="pa-ch" id="iterate">
          <ChapterHead date="06-29" title="첫 반복은 하루 만에 왔다." />
          <p className="pa-lead pa-center pa-rv">
            v1.0의 현황판은 숫자 나열이었다. 보고 나서 하루 만에
            <strong> 비교 막대와 과목별 진척 시각화</strong>로 바꿨다 —
            이 프로젝트의 리듬(써 보고, 걸리는 곳을 바로 고치는)이 여기서 만들어졌다.
          </p>
          <div className="pa-pair pa-rv">
            <figure>
              <img src="/img/projects/adsp/v1-0-dashboard.png" alt="v1.0 대시보드 — 숫자 나열 현황" loading="lazy" />
              <figcaption>v1.0 — 숫자 나열</figcaption>
            </figure>
            <figure>
              <img src="/img/projects/adsp/v1-1-dashboard.png" alt="v1.1 대시보드 — 비교 막대·과목별 진척" loading="lazy" />
              <figcaption>v1.1 — 비교·추이 시각화</figcaption>
            </figure>
          </div>
        </section>

        {/* 3 구조 — 절 재정의 + 지표 4종 */}
        <section className="pa-ch pa-ch-wash" id="structure">
          <ChapterHead date="07-01 ~ 07-02" title="단위와 지표를 다시 세웠다." />
          <p className="pa-lead pa-center pa-rv">
            진도 단위를 임의 20일 배분에서 <strong>과목 체계 그대로의 절(節) 29개</strong>로
            재정의했다 — 어느 절을 알고 모르는지가 그대로 드러나는 단위.
            지표도 하나의 &lsquo;성취도&rsquo;로 뭉치지 않고 <strong>4종으로 분리해 혼용을 금지</strong>했다.
            탭을 눌러 확인해 보세요.
          </p>
          <div className="pa-rv"><MetricTabs /></div>
        </section>

        {/* 4 정착 — 쓰이게 만들기 */}
        <section className="pa-ch" id="adopt">
          <ChapterHead date="07-03" title="쓰이게 만드는 게 더 어려웠다." />
          <p className="pa-lead pa-center pa-rv">
            도구를 만드는 것과 8명이 매일 쓰게 만드는 것은 다른 문제였다.
            &ldquo;한눈에 안 들어온다&rdquo;는 피드백에 맞춰 붙인 것이 아니라 <strong>덜어냈다.</strong>
          </p>
          <div className="pa-feat-grid">
            <div className="pa-feat pa-rv">
              <h3>&lsquo;오늘 할 진도&rsquo; 위젯</h3>
              <p>접속하면 오늘 범위와 밀린 범위가 맨 위에 뜬다. 메인 지표는 5개에서 3개로 줄였다 —
                &ldquo;오늘 뭐 하지&rdquo;에 바로 답하는 화면.</p>
            </div>
            <div className="pa-feat pa-rv">
              <h3>사용법 가이드</h3>
              <p>실제 화면 캡처 6컷에 빨간 표시를 얹은 온보딩 페이지. 공지 글 대신
                누르면 바로 화면이 나오는 고정 진입점으로 만들었다.</p>
            </div>
          </div>
        </section>

        {/* 5 품질 — 데이터 계층 격리 */}
        <section className="pa-ch pa-ch-wash" id="quality">
          <ChapterHead date="07-11" title="보이지 않는 곳도 정리했다." />
          <p className="pa-lead pa-center pa-rv">
            화면 곳곳에 흩어져 있던 DB 접근 31곳을 <strong>한 계층으로 격리</strong>했다.
            동작은 그대로 — 대신 보안 규칙이나 스키마가 바뀔 때 고칠 곳이 한 곳이 됐다.
            운영 중인 도구일수록 이런 정리가 뒤에서 사고를 막는다.
          </p>
        </section>

        {/* 6 운영 — 속성 세션 */}
        <section className="pa-ch" id="ops">
          <ChapterHead date="07-24" title="데이터가 운영 결정을 바꿨다." />
          <p className="pa-lead pa-center pa-rv">
            보드에 쌓인 기록으로 팀별 진도차를 확인하고, 남은 2주 계획을 다시 짰다 —
            전 범위를 균등하게 가는 대신 <strong>1·2과목을 속성 세션으로 마감</strong>하고
            3과목은 기출과 병행. 배점(3과목이 절반 이상)이 근거였다.
          </p>
          <Decision
            problem="한 팀의 진도가 계획 대비 밀림 — 남은 2주에 전 범위는 불가"
            decision="속성 세션으로 1·2과목 마감, 3과목은 기출 해설로 병행"
            result="강독 없이 진단 문항 → 오답 범위 복습의 인출 중심 세션" />
        </section>

        {/* 7 실전 — 문항 가독성 개편 + 중요도 배지 */}
        <section className="pa-ch pa-ch-wash" id="exam">
          <ChapterHead date="07-26 ~ 07-30" title="실전처럼 보이게, 버릴 건 버리게." />
          <p className="pa-lead pa-center pa-rv">
            &ldquo;실제 문제와 다르게 보인다&rdquo;는 피드백 — 표·코드 출력의 정렬이 화면에서
            무너지고 있었다. 문제는 <strong>답안 기록 2,425건이 이미 쌓여 있어</strong> 문항을
            갈아끼울 수 없다는 것.
          </p>
          <Decision
            problem="표기를 고쳐야 하는데 기존 응시 기록이 깨지면 안 된다"
            decision="개정판 두 벌 대신 같은 문항을 제자리 수정 — 선택지 순서·정답 불변을 하드룰로, 위반 시 스크립트가 중단"
            result="전 문항 전수 대조로 정답·선택지 변경 0건 — 기록 손실 없이 표기만 교체" />
          <p className="pa-lead pa-center pa-rv">
            시험 9일 전에는 반대 방향의 결정 — <strong>버릴 것을 정했다.</strong> 절마다
            중요도 배지(★핵심·낮음)를 달고, &lsquo;낮음&rsquo;에는 &ldquo;건너뛰어도 된다&rdquo;는
            근거를 명시했다. 안 보는 것이 불안이 아니라 결정이 되도록.
          </p>
        </section>

        {/* 8 마감 — 잠금 + 결과 + 나머지 개선 스트립 */}
        <section className="pa-ch" id="close">
          <ChapterHead date="08-08 ~ 08-10" title="기록을 굳히고, 보드를 잠갔다." />
          <p className="pa-lead pa-center pa-rv">
            시험이 끝나자 기록은 확정됐다. 시험 당일 데이터를 분리 보관한 뒤
            <strong> 보드의 쓰기 경로를 전부 닫아 읽기전용 아카이브</strong>로 남겼다 —
            1기가 어땠는지는 이제 덮이지 않는다.
          </p>
          <div className="pa-rv"><WeeklyChart /></div>
          <div className="pa-rv"><ToolCarousel /></div>

          <div className="pa-minors pa-rv">
            <h3 className="pa-sub-h">그 사이의 개선들</h3>
            <ul>
              {MINOR_ITEMS.map((m) => (
                <li key={m.text}><span className="pa-minor-date">{m.date}</span>{m.text}</li>
              ))}
            </ul>
          </div>

          <div className="pa-cta-block pa-rv">
            <h3 className="pa-cta-title">이 과정을 <em>당신의 프로젝트</em>로.</h3>
            <p>기획은 사람이, 구현은 AI가 — 필요한 도구를 직접 만들어 운영하는 법을 AIM에서 같이 합니다.</p>
            <div className="pa-cta-row">
              <a className="btn-dark" href="/recruit/">AIM 1기 모집 보기 <Arrow /></a>
              <a className="btn-2nd" href={BOARD_URL} target="_blank" rel="noreferrer">보드 직접 보기 <Arrow /></a>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
