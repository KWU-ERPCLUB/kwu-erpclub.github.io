// ADsP 스터디 1기 — 인터랙티브 상세 v7(시각화·모션 재설계 spec 2026-08-24). 여정 = erp-club/roadmap.md §62·§64 · 원천 = adsp/1기-회고.md.
// 서사: 기획(베타) → 구조(두 팀 리듬) → 학습 설계 → 제작 → 로드맵(시간축) → 실패 → 회고(판정·지표 간극·피드백·노트).
// 골격 3종 교대(G1 풀블리드 시각 / G2 좌텍스트-우스티키 / G3 카드 그리드) — 연속 동일 골격 금지.
// 시각 오브젝트 V1~V5 = project-adsp-objects.jsx(V4 DotField = viz). 수치 수위 = 합격률만(테스트 강제).
import { useEffect } from 'react'
import { SiteNav, SiteFooter, Arrow } from '../shared.jsx'
import { CountUp, useItemReveal, prefersReduced } from '../home-motion.jsx'
import { recruitPhase, localYmd } from '../home-logic.js'
import {
  MetricTable, ToolCarousel, BuildLoop, BuildPrinciples, BuildEvidence, PromptCard, CodeStats,
} from './project-adsp-parts.jsx'
import { ToggleCompare, FailCards, VerdictSplit } from './project-adsp-viz.jsx'
import { FlowChain, RoadmapRail, TeamSplit, SplitList } from './project-adsp-road.jsx'
import { PassIsotype, TeamRhythm, MetricGap } from './project-adsp-objects.jsx'
import {
  HERO_STATS, CHAPTERS, TEXTBOOK, STUDY_FLOW, STACK_FLOW,
  RESULT, RETRO_POINTS, FEEDBACK_DESIGN, FEEDBACK_POINTS, NEXT_KEEP, NEXT_CHANGE,
} from '../data/project-adsp-data.js'

// 챕터 스파이 — 뷰포트 중앙이 속한 챕터를 로컬 나브에 반영.
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

// 챕터 헤드 — 날짜 눈썹(회색) + 정보형 제목.
function ChapterHead({ date, title }) {
  return (
    <header className="pa-ch-head pa-rv">
      <span className="pa-ch-date">{date}</span>
      <h2 className="pa-ch-title">{title}</h2>
    </header>
  )
}

// 결정 — 문제 → 결정 → 결과. 무테(카드 금지), 결정만 틴트 박스.
function Decision({ problem, decision, result }) {
  return (
    <div className="pa-dflow pa-rv">
      <div className="pa-dstep"><span className="pa-dlabel">문제</span><p>{problem}</p></div>
      <span className="pa-darrow" aria-hidden="true">→</span>
      <div className="pa-dstep main"><span className="pa-dlabel">결정</span><p>{decision}</p></div>
      <span className="pa-darrow" aria-hidden="true">→</span>
      <div className="pa-dstep"><span className="pa-dlabel">결과</span><p>{result}</p></div>
    </div>
  )
}

// 사실 목록 — {k, desc} 공용 무테 리스트. variant: num(번호)·quote(인용). 스태거 = --i.
function FactList({ items, variant = '' }) {
  return (
    <ol className={`pa-facts${variant ? ` ${variant}` : ''}`}>
      {items.map((f, i) => (
        <li className="pa-fact pa-rv" key={f.k} style={{ '--i': i }}>
          <span className="pa-fact-chip" aria-hidden="true">{variant === 'quote' ? '“' : i + 1}</span>
          <div><h3>{f.k}</h3><p>{f.desc}</p></div>
        </li>
      ))}
    </ol>
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
  const heroCounts = HERO_STATS.filter((s) => s.label !== '최종 합격률')
  return (
    <>
      <SiteNav />
      <nav className="pa-nav" aria-label="ADsP 1기 챕터">
        <div className="pa-nav-in">
          <span className="pa-nav-title">ADsP 스터디 1기</span>
          <div className="pa-nav-links">
            {CHAPTERS.map((c) => <a key={c.id} href={`#${c.id}`}>{c.label}</a>)}
          </div>
        </div>
      </nav>

      <main id="main" className="pa-main">
        {/* 히어로(G1) — 아이소타입이 주인공, 캡처 상단이 첫 화면 하단에 걸침(D3) */}
        <section className="pa-hero">
          <div className="pa-hero-core">
            <span className="pa-hero-label">PROJECT · ERP연구회 베타 스터디</span>
            <h1 className="pa-hero-title">ADsP 스터디 <em>1기</em></h1>
            <p className="pa-hero-sub">
              8명이 6주를 달렸습니다.<br />
              관리를 위해 <strong>학습 대시보드를 직접 만들었습니다.</strong>
            </p>
            <PassIsotype taken={10} passed={5} />
            <div className="pa-hero-stats">
              {heroCounts.map((s) => (
                <div className="pa-hstat" key={s.label}>
                  <CountUp value={s.value} />
                  <span className="pa-hstat-label">{s.label}</span>
                  <span className="pa-hstat-src">{s.src}</span>
                </div>
              ))}
            </div>
          </div>
          <img className="pa-hero-shot pa-rv" src="/img/projects/adsp/home-now.png"
            alt="ADsP 진도 보드 대시보드 실측 화면" loading="lazy" />
        </section>

        {/* 1 기획 — 텍스트 골격 */}
        <section className="pa-ch pa-ch-wash" id="plan">
          <ChapterHead date="06-26" title="기획, 지속 가능한지 시험하는 베타" />
          <p className="pa-lead pa-center pa-rv">
            목표는 합격만이 아니었다.<br />
            자격증 스터디가 <strong>계속 굴러갈 수 있는지, 운영 방식 자체를 시험</strong>했다.
          </p>
          <Decision
            problem="자격증 스터디는 흔히 카톡방만 남고 끝난다"
            decision="1기를 베타로 규정하고, 운영 데이터를 남겨 지속 가능성을 검증"
            result="6주 완주와 운영 기록. 이 페이지 끝의 다음 기수 노트" />
        </section>

        {/* 2 구조(G1) — 두 팀 리듬 격자 + 팀 텍스트 */}
        <section className="pa-ch" id="team">
          <ChapterHead date="06-26" title="8명, 서로 다른 두 방식" />
          <p className="pa-lead pa-center pa-rv">
            만나는 방식이 다른 두 팀.<br />
            <strong>진도를 한눈에 볼 공통의 화면</strong>이 필요했고, 여기서 대시보드가 태어났다.
          </p>
          <div className="pa-rv"><TeamRhythm /></div>
          <TeamSplit />
        </section>

        {/* 3 학습 설계(G3) — 교재 + 5단 플로우 */}
        <section className="pa-ch pa-ch-wash" id="study">
          <ChapterHead date="06-30 ~" title="교재 없이도 합격이 가능한 구조" />
          <p className="pa-lead pa-center pa-rv">
            주 교재의 목차로 25일 계획을 짰다.<br />
            <strong>대시보드만 따라가면 합격이 가능하도록</strong> 내용을 다시 정리해 실었다.
          </p>
          <figure className="pa-book pa-rv">
            <img className="pa-book-cover" src={TEXTBOOK.img} alt={TEXTBOOK.alt} loading="lazy" />
            <div className="pa-book-txt">
              <figcaption>{TEXTBOOK.caption}</figcaption>
              <p><strong>원문을 옮겨 싣지 않았다.</strong> {TEXTBOOK.note}</p>
            </div>
          </figure>
          <FlowChain items={STUDY_FLOW} ariaLabel="학습 콘텐츠 구조" tone="hot" />
        </section>

        {/* 4 제작 — 3층 스택 + 루프 + 실측 + 원칙(무테) + 실물 */}
        <section className="pa-ch" id="build">
          <ChapterHead date="6주 공통" title="세 개의 층, 코드를 쓴 AI" />
          <p className="pa-lead pa-center pa-rv">
            대시보드는 세 층으로 되어 있고, 서버 비용은 0원.<br />
            코드는 전부 <strong>Claude Code(Opus 5 모델)가 작성</strong>했다.
          </p>
          <FlowChain items={STACK_FLOW} ariaLabel="대시보드 구성 요소" />
          <h3 className="pa-sub-h pa-gap-l pa-rv">6주를 돌린 제작 루프</h3>
          <p className="pa-lead pa-center pa-rv">
            사람은 정하고 검수한다. <strong>구현은 AI</strong>가 한다.
          </p>
          <div className="pa-rv"><BuildLoop /></div>
          <div className="pa-block pa-rv"><CodeStats /></div>
          <h3 className="pa-sub-h pa-gap-l pa-rv">일을 시키는 방식, 원칙 4개</h3>
          <BuildPrinciples />
          <h3 className="pa-sub-h pa-gap-l pa-rv">실물 기록</h3>
          <div className="pa-rv"><BuildEvidence /></div>
        </section>

        {/* 5 로드맵(G2) — 좌 스티키 시간축 + 우 카드 */}
        <section className="pa-ch pa-ch-wash" id="roadmap">
          <ChapterHead date="06-28 ~ 08-10" title="어떤 결정으로 여기까지 왔나" />
          <p className="pa-lead pa-center pa-rv">
            카드는 <strong>방향을 바꾼 결정</strong>.<br />
            사이의 자잘한 결정은 카드 아래에, AI 지시는 해당 지점에.
          </p>
          <RoadmapRail media={{
            viz: (
              <ToggleCompare
                a={{ img: '/img/projects/adsp/v1-0-dashboard.png', label: 'v1.0 이전', alt: 'v1.0 대시보드, 숫자 나열 현황' }}
                b={{ img: '/img/projects/adsp/v1-1-dashboard.png', label: 'v1.1 개선 후', alt: 'v1.1 대시보드, 비교 막대와 과목별 진척' }}
                caption="같은 데이터, 하루 차이" />
            ),
            metrics: (<><PromptCard idx={0} /><MetricTable /><PromptCard idx={1} /></>),
            fix: (
              <>
                <ToggleCompare
                  a={{ img: '/img/projects/adsp/shot-question-before.png', label: '수리 전', alt: '문항 화면, 표 정렬이 무너진 상태' }}
                  b={{ img: '/img/projects/adsp/shot-question-after.png', label: '수리 후', alt: '문항 화면, 표와 코드 정렬 수리 후' }}
                  caption="같은 문항의 제자리 수정" />
                <PromptCard idx={2} />
              </>
            ),
            close: (<ToolCarousel />),
          }} />
        </section>

        {/* 6 실패(G3) */}
        <section className="pa-ch" id="fail">
          <ChapterHead date="6주 공통" title="안 됐던 것들" />
          <p className="pa-lead pa-center pa-rv">
            성공만 남기면 광고가 된다. <strong>실제로 틀렸던 것들</strong>과 그 원인.
          </p>
          <FailCards />
        </section>

        {/* 7 회고 — G2 도트 필드 → 판정(무테) → G1 지표 간극 → 피드백(무테) → G3 노트·판정 */}
        <section className="pa-ch pa-ch-wash" id="retro">
          <ChapterHead date="08-08 ~ 08-24" title={`회고, ${RESULT.headline}`} />
          <p className="pa-lead pa-center pa-rv">
            <strong>{RESULT.headline}({RESULT.rate}).</strong> {RESULT.frame}
          </p>
          {/* DotField(답안 도트) = 오너 최종 제외(08-24 재확정: 회고 흐름을 깸). 부품은 viz에 보관 */}
          <h3 className="pa-sub-h pa-gap-l pa-rv">왜 그랬는가, 세 가지 판정</h3>
          <FactList items={RETRO_POINTS} variant="num" />
          <div className="pa-rv"><MetricGap /></div>

          <h3 className="pa-sub-h pa-gap-l pa-rv">익명 피드백이 가리킨 곳</h3>
          <p className="pa-lead pa-center pa-rv">{FEEDBACK_DESIGN}</p>
          <FactList items={FEEDBACK_POINTS} variant="quote" />

          <h3 className="pa-sub-h pa-gap-l pa-rv">다음 기수 노트</h3>
          <SplitList
            left={{ title: '다음 기수에도 유지', tone: 'ok', glyph: '✓', items: NEXT_KEEP }}
            right={{ title: '다음 기수에는 바꾼다', tone: 'hot', glyph: '↻', items: NEXT_CHANGE }} />

          <h3 className="pa-sub-h pa-gap-l pa-rv">이 방식 자체의 판정</h3>
          <VerdictSplit />
        </section>

        {/* CTA — 별도 면(차콜 밴드). 모집 창(RECRUIT.window) 동안만 노출 */}
        {recruitPhase(localYmd()) === 'open' ? (
          <section className="pa-cta-band">
            <div className="pa-cta-block pa-rv">
              <h3 className="pa-cta-title">이 기록은 <em>AIM</em>의 작업 방식 예시입니다.</h3>
              <p>AIM은 광운대 경영학부의 MIS·AI 스터디입니다.
                웹 제작이 아니라 AI를 일에 쓰는 방식을 다루고, 필요한 도구는 이렇게 직접 만들어 씁니다.</p>
              <div className="pa-cta-row">
                <a className="btn-light" href="/recruit/">AIM 1기 모집 보기 <Arrow /></a>
              </div>
            </div>
          </section>
        ) : null}
      </main>
      <SiteFooter />
    </>
  )
}
