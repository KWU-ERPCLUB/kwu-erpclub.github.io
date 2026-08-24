// ADsP 스터디 1기 — 인터랙티브 상세 v2. 여정 = erp-club/roadmap.md §62·§64 · 원천 = adsp/1기-회고.md.
// v2 개편(2026-08-24, 오너 문안 정합 후 구현): 서사 = 기획(베타 취지) → 구조(1팀 온라인/2팀 오프라인 →
// 대시보드 결정) → 학습 설계(교재 재정리 — 저작권 프레이밍) → 제작(비개발자용 시각화) → 고도화 로드맵
// (핵심 결정 + 자잘한 결정 교차 레일) → 실패 → 회고(합격률 50%·보류 프레임·피드백·다음 기수 노트).
// 수치 수위 = 합격률만(완주↔합격 교차·문항 총계 미게재, 테스트 강제). 챕터당 문단 ≤2·정보형 제목·keep-all.
import { useEffect } from 'react'
import { SiteNav, SiteFooter, Arrow } from '../shared.jsx'
import { CountUp, useItemReveal, prefersReduced } from '../home-motion.jsx'
import {
  MetricTable, ToolCarousel, BuildLoop, BuildPrinciples, BuildEvidence, PromptCard, CodeStats,
} from './project-adsp-parts.jsx'
import { DotField, ToggleCompare, FailCards, VerdictSplit } from './project-adsp-viz.jsx'
import { FlowChain, RoadmapRail } from './project-adsp-road.jsx'
import {
  HERO_STATS, CHAPTERS, TEAM_FACTS, TEXTBOOK, STUDY_FLOW, STACK_FLOW,
  RESULT, RETRO_POINTS, FEEDBACK_DESIGN, FEEDBACK_POINTS, NEXT_KEEP, NEXT_CHANGE,
} from '../data/project-adsp-data.js'

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

// 챕터 헤드 — 날짜 눈썹 + 정보형 제목.
function ChapterHead({ date, title }) {
  return (
    <header className="pa-ch-head pa-rv">
      <span className="pa-ch-date">{date}</span>
      <h2 className="pa-ch-title">{title}</h2>
    </header>
  )
}

// 결정 카드 — 문제 → 결정 → 결과 3칸.
function Decision({ problem, decision, result }) {
  return (
    <div className="pa-dgrid pa-rv">
      <div className="pa-dcell"><span className="pa-dcell-label">문제</span><p>{problem}</p></div>
      <div className="pa-dcell main"><span className="pa-dcell-label">결정</span><p>{decision}</p></div>
      <div className="pa-dcell"><span className="pa-dcell-label">결과</span><p>{result}</p></div>
    </div>
  )
}

// 카드 그리드 — {k, desc} 목록 공용(팀 구조·회고·피드백).
function FactGrid({ items, cols3 = false }) {
  return (
    <div className={`pa-feat-grid${cols3 ? ' cols3' : ''}`}>
      {items.map((f) => (
        <div className="pa-feat pa-rv" key={f.k}>
          <h3>{f.k}</h3>
          <p>{f.desc}</p>
        </div>
      ))}
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
        </div>
      </nav>

      <main id="main" className="pa-main">
        {/* 히어로 — 베타 스터디가 주어 */}
        <section className="pa-hero">
          <span className="pa-hero-label">PROJECT · 2026-06-26 ~ 08-08</span>
          <h1 className="pa-hero-title">ADsP 스터디 <em>1기</em></h1>
          <p className="pa-hero-sub">
            ERP연구회가 자격증 스터디를 계속 열 수 있는지 확인하기 위해 만든 첫 베타 스터디입니다.
            8명이 6주를 달렸고, 관리를 위해 학습 대시보드를 직접 만들었습니다.
            어떻게 기획하고, 만들고, 운영했고, 무엇을 배웠는지의 기록입니다.
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

        {/* 1 기획 — 왜 이 스터디인가 */}
        <section className="pa-ch pa-ch-wash" id="plan">
          <ChapterHead date="06-26" title="기획 — 자격증 스터디가 지속 가능한지 시험하는 베타" />
          <p className="pa-lead pa-center pa-rv">
            이 스터디는 ADsP 합격만을 위한 모임이 아니었다. ERP연구회 산하에서 ADsP·SQLD 같은
            <strong> 자격증 스터디가 정상적으로, 지속적으로 운영될 수 있는지 시험하는 베타</strong> —
            1기의 목표는 합격과 함께 &lsquo;다음 기수를 열 수 있는 운영 방식&rsquo;을 찾는 것이었다.
          </p>
          <Decision
            problem="자격증 스터디는 흔히 의욕으로 시작해 카톡방만 남고 끝난다"
            decision="1기를 베타로 규정 — 운영 데이터를 남겨 지속 가능성 자체를 검증 대상으로"
            result="6주 완주와 운영 기록 — 이 페이지 끝의 다음 기수 노트가 그 산출물" />
        </section>

        {/* 2 구조 — 모집·팀 구성, 그리고 대시보드가 태어난 이유 */}
        <section className="pa-ch" id="team">
          <ChapterHead date="06-26" title="구조 — 8명 두 팀, 서로 다른 두 방식" />
          <p className="pa-lead pa-center pa-rv">
            총 8명을 모집해 <strong>1팀 4명은 매일 온라인, 2팀 4명은 주 1회 오프라인</strong>으로
            나눠 진행했다. 팀이 갈리고 대면 기회가 적으니 카톡만으로는 진도 확인과 점검이
            어렵겠다고 판단했고 — <strong>여기서 학습 대시보드 신설이 결정</strong>됐다.
          </p>
          <FactGrid items={TEAM_FACTS} />
        </section>

        {/* 3 학습 설계 — 교재 하나를 대시보드로(재정리 프레이밍 = 오너 확정) */}
        <section className="pa-ch pa-ch-wash" id="study">
          <ChapterHead date="06-30 ~" title="학습 설계 — 교재 없이도 합격이 가능한 구조" />
          <p className="pa-lead pa-center pa-rv">
            진도를 재려면 기준이 필요하다. 주 교재의 목차(절 29개)로 25일 학습 계획을 짜고,
            학생들이 공부하기 편하도록 내용을 개편해 — <strong>교재가 없어도 대시보드의
            정리본·퀴즈·모의고사만 따라가면 합격이 가능하도록</strong> 구조를 잡았다.
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

        {/* 4 제작 — 비개발자용 구조 + AI 활용 */}
        <section className="pa-ch" id="build">
          <ChapterHead date="6주 공통" title="제작 — 세 개의 층, 그리고 코드를 쓴 AI" />
          <p className="pa-lead pa-center pa-rv">
            대시보드는 세 개의 층으로 되어 있다 — 보이는 화면, 기록이 쌓이는 저장소,
            코드를 올리면 알아서 갱신되는 배포. 서버 비용은 0원이고,
            <strong> 이 세 층의 코드는 전부 Claude Code(Opus 5 모델)가 작성</strong>했다.
            사람은 무엇을 왜 만들지 정하고 결과를 검수했다.
          </p>
          <FlowChain items={STACK_FLOW} ariaLabel="대시보드 구성 요소" />
          <div className="pa-rv"><BuildLoop /></div>
          <div className="pa-rv"><CodeStats /></div>
          <p className="pa-lead pa-center pa-rv">
            도구보다 중요한 건 <strong>일을 시키는 방식</strong>이었다.
            이 프로젝트에서 지킨 원칙 4개 — 각각 실제 사례에 근거가 있다.
          </p>
          <BuildPrinciples />
          <div className="pa-rv"><BuildEvidence /></div>
        </section>

        {/* 5 로드맵 — 핵심 결정 + 자잘한 결정의 시간순 레일 */}
        <section className="pa-ch pa-ch-wash" id="roadmap">
          <ChapterHead date="06-28 ~ 08-10" title="고도화 로드맵 — 어떤 결정으로 여기까지 왔나" />
          <p className="pa-lead pa-center pa-rv">
            6주간 커밋 248개는 결국 결정의 연속이다. 굵은 카드가 방향을 바꾼 결정,
            사이의 한 줄들이 그 사이의 자잘한 결정 — 각 카드는
            <strong> 문제 → 결정 → 결과</strong>로 읽으면 된다. AI에게 실제로 내린 지시는
            해당 지점에 함께 붙였다.
          </p>
          <RoadmapRail media={{
            viz: (
              <ToggleCompare
                a={{ img: '/img/projects/adsp/v1-0-dashboard.png', label: 'v1.0 이전', alt: 'v1.0 대시보드 — 숫자 나열 현황' }}
                b={{ img: '/img/projects/adsp/v1-1-dashboard.png', label: 'v1.1 개선 후', alt: 'v1.1 대시보드 — 비교 막대·과목별 진척' }}
                caption="같은 데이터, 하루 차이 — 숫자 나열에서 비교·추이 시각화로" />
            ),
            metrics: (<><PromptCard idx={0} /><MetricTable /><PromptCard idx={1} /></>),
            fix: (
              <>
                <ToggleCompare
                  a={{ img: '/img/projects/adsp/shot-question-before.png', label: '수리 전', alt: '문항 화면 — 표 정렬이 무너진 상태' }}
                  b={{ img: '/img/projects/adsp/shot-question-after.png', label: '수리 후', alt: '문항 화면 — 표·코드 정렬 수리 후' }}
                  caption="같은 문항의 제자리 수정 — 정답·선택지 순서는 하드룰로 불변" />
                <PromptCard idx={2} />
              </>
            ),
            close: (<ToolCarousel />),
          }} />
        </section>

        {/* 6 실패 — 안 됐던 것들(원인 분석 동반) */}
        <section className="pa-ch" id="fail">
          <ChapterHead date="6주 공통" title="안 됐던 것들 — 실패와 한계" />
          <p className="pa-lead pa-center pa-rv">
            성공만 남기면 기록이 아니라 광고가 된다. 6주 동안 <strong>실제로 틀렸던 것</strong>과
            아직 남아 있는 한계 — 각각 원인까지.
          </p>
          <FailCards />
        </section>

        {/* 7 회고 — 합격률·원인·피드백·다음 기수 노트 */}
        <section className="pa-ch pa-ch-wash" id="retro">
          <ChapterHead date="08-08 ~ 08-24" title={`회고 — ${RESULT.headline}, 그리고 남긴 숙제`} />
          <p className="pa-lead pa-center pa-rv">
            제50회 시험 결과, <strong>{RESULT.headline}({RESULT.rate})</strong>. {RESULT.frame}
          </p>
          <p className="pa-lead pa-center pa-rv">
            수치보다 무거운 것은 <strong>왜 그랬는가</strong>다. 시험이 끝난 뒤 활동 데이터와
            익명 피드백을 대조해 세 가지로 판정했다.
          </p>
          <FactGrid items={RETRO_POINTS} cols3 />
          <DotField />

          <h3 className="pa-sub-h pa-rv">익명 피드백이 가리킨 곳</h3>
          <p className="pa-lead pa-center pa-rv">{FEEDBACK_DESIGN}</p>
          <FactGrid items={FEEDBACK_POINTS} cols3 />

          <h3 className="pa-sub-h pa-rv">다음 기수 노트 — 유지할 것과 바꿀 것</h3>
          <div className="pa-verdict pa-rv">
            <div className="pa-vd-col">
              <h3>다음 기수에도 유지</h3>
              <ul>{NEXT_KEEP.map((t) => <li key={t}>{t}</li>)}</ul>
            </div>
            <div className="pa-vd-col limit">
              <h3>다음 기수에는 바꾼다</h3>
              <ul>{NEXT_CHANGE.map((t) => <li key={t}>{t}</li>)}</ul>
            </div>
          </div>
          <div className="pa-rv"><VerdictSplit /></div>

          <div className="pa-cta-block pa-rv">
            {/* 권유형 카피 = 오너 삭제 2026-08-15 → 운영 사실 서술 유지 */}
            <h3 className="pa-cta-title">AIM 1기도 <em>같은 방식</em>으로 굴립니다.</h3>
            <p>기획은 사람이 쓰고 구현은 AI에 맡기는 방식으로, 필요한 도구를 직접 만들어 운영합니다.</p>
            <div className="pa-cta-row">
              <a className="btn-dark" href="/recruit/">AIM 1기 모집 보기 <Arrow /></a>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
