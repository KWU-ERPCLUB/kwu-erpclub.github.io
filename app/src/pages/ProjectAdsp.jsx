// ADsP 스터디 1기 — 인터랙티브 상세. 구 spec 압축 = erp-club/docs/아카이브.md · 여정 = erp-club/roadmap.md §62·§64
// 2026-08-24 대체 개편(오너 확정): 시계열 10챕터 → 4축 흐름(운영 / 도구 / AI 활용 / 의사결정) + 실패·결과·다음 기수.
// 원천 = adsp/1기-회고.md. 수치 수위 = 합격률 50%만 게재(완주↔합격 교차는 서술만, 오너 픽 08-24).
// 시각 부품(도트·토글·실패 카드·판정·타일)은 08-13 고도화분 전부 재사용 — 신규 CSS는 cols3 한 줄.
// 텍스트 규칙: 정보형 제목·챕터당 문단 ≤2·핵심구만 볼드·keep-all. 수치 = data/project-adsp-data.js 단일원천.
import { useEffect } from 'react'
import { SiteNav, SiteFooter, Arrow } from '../shared.jsx'
import { CountUp, useItemReveal, prefersReduced } from '../home-motion.jsx'
import {
  MetricTable, ToolCarousel, BuildLoop, BuildPrinciples, BuildEvidence, PromptCard,
  ToolTiles, CodeStats, LogRail,
} from './project-adsp-parts.jsx'
import { DotField, ToggleCompare, FailCards, VerdictSplit } from './project-adsp-viz.jsx'
import {
  HERO_STATS, CHAPTERS, OPS_FACTS, RESULT, RETRO_POINTS,
  FEEDBACK_DESIGN, FEEDBACK_POINTS, NEXT_KEEP, NEXT_CHANGE,
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

// 카드 그리드 — {k, desc} 목록 공용(운영 팩트·회고·피드백). 기존 pa-feat 스킨 재사용.
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
        {/* 히어로 — 스터디 1기가 주어. AIM의 방식 예제이자, 다음 ADsP 기수의 운영 참조 */}
        <section className="pa-hero">
          <span className="pa-hero-label">PROJECT · 2026-06-26 ~ 08-08</span>
          <h1 className="pa-hero-title">ADsP 스터디 <em>1기</em></h1>
          <p className="pa-hero-sub">
            자격시험을 준비하는 8명의 진도·자료·퀴즈·기출을 한 화면에 모은 학습 보드를
            직접 만들어 6주를 운영했습니다. 기획은 사람이, 구현은 AI가.
            어떻게 운영했고, 무엇으로 만들었고, 어떤 결정을 했고, 결과가 어땠는지의 기록입니다.
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

        {/* 1 운영 — 스터디가 어떻게 돌아갔나(다음 기수 참조의 본체) */}
        <section className="pa-ch pa-ch-wash" id="ops">
          <ChapterHead date="06-26 ~ 08-08" title="운영 방식 — 예습 기반 주 1회, 데이터로 조정하는 6주" />
          <p className="pa-lead pa-center pa-rv">
            모임은 주 1회뿐이다. 대신 <strong>예습은 보드가, 조정은 데이터가</strong> 맡았다.
            평일에는 각자 정리본을 읽고 절 퀴즈를 풀고, 모임에서는 막힌 곳만 다루고,
            매주 리포트로 다음 주를 정하는 구조 — 아래 네 가지가 1기 운영의 뼈대다.
          </p>
          <FactGrid items={OPS_FACTS} />
          <p className="pa-lead pa-center pa-rv">
            계획은 고정하지 않았다. 4주 차에 한 팀의 진도가 계획 대비 밀린 것이
            데이터로 확인되자 <strong>남은 2주를 재설계</strong>했다.
          </p>
          <Decision
            problem="한 팀의 진도가 계획 대비 밀림 — 남은 2주에 전 범위는 불가"
            decision="속성 세션으로 1·2과목 마감, 3과목은 기출 해설로 병행 (배점이 근거)"
            result="강독 없이 진단 문항 → 오답 범위 복습의 인출 중심 세션" />
        </section>

        {/* 2 도구 — 무엇으로 만들었나 */}
        <section className="pa-ch" id="tools">
          <ChapterHead date="6주 공통" title="무엇으로 — 서버 비용 0원 스택, 2일 만의 첫 배포" />
          <p className="pa-lead pa-center pa-rv">
            도구는 네 가지가 전부다. 전부 만들고 시작하는 대신
            <strong> 진도 체크와 현황판 두 기능만 담아 2일 만에 배포</strong>했고,
            가입 절차도 뺐다(이름+PIN 입장) — 8명에게 가입을 요구하면 그 자체가 이탈 지점이 된다.
          </p>
          <div className="pa-rv"><ToolTiles /></div>
          <div className="pa-rv"><CodeStats /></div>
        </section>

        {/* 3 AI 활용 — 어떻게 일을 시켰나 */}
        <section className="pa-ch pa-ch-wash" id="ai">
          <ChapterHead date="6주 공통" title="AI 활용 — 기획·검수는 사람, 구현은 Claude Code" />
          <p className="pa-lead pa-center pa-rv">
            코드는 <strong>Claude Code(Opus 5 모델)가 작성</strong>하고, 무엇을 왜 만들지 정하는
            <strong> 기획·검수는 사람</strong>이 맡았다. 요구사항을 spec 문서로 확정하면
            AI가 구현하고, main에 올리면 자동 배포 — 이 루프를 6주간 반복했다.
          </p>
          <div className="pa-rv"><BuildLoop /></div>
          <p className="pa-lead pa-center pa-rv">
            도구보다 중요한 건 <strong>일을 시키는 방식</strong>이었다.
            이 프로젝트에서 지킨 원칙 4개 — 각각 아래 실제 사례에 근거가 있다.
          </p>
          <BuildPrinciples />
          <div className="pa-rv"><PromptCard idx={0} /></div>
          <div className="pa-rv"><BuildEvidence /></div>
        </section>

        {/* 4 의사결정 — 대시보드와 운영을 움직인 결정들 */}
        <section className="pa-ch" id="decide">
          <ChapterHead date="06-26 ~ 07-30" title="의사결정 — 대시보드와 운영을 움직인 결정들" />
          <p className="pa-lead pa-center pa-rv">
            6주의 커밋 248개는 결국 몇 개의 결정으로 요약된다.
            진도 단위를 임의 20일 배분에서 <strong>교재 체계 그대로의 절(節) 29개</strong>로
            재정의했고, 지표는 하나의 &lsquo;성취도&rsquo;로 뭉치지 않고 4종으로 분리했다.
          </p>
          <Decision
            problem="'성취도 82%' 하나로는 진도가 부족한지 정확도가 부족한지 구분되지 않았다"
            decision="정답률·진행도·실전점수·종합준비도로 분리하고 화면에서 혼용을 금지"
            result="누가 어디서 막혔는지가 숫자로 바로 보임 — 운영 조정(속성 세션)의 근거가 됐다" />
          <div className="pa-rv"><PromptCard idx={1} /></div>
          <div className="pa-rv"><MetricTable /></div>

          <p className="pa-lead pa-center pa-rv">
            만드는 것과 <strong>쓰게 만드는 것</strong>은 다른 문제였다. 배포 다음 날
            숫자 나열을 시각화로 교체했고, &ldquo;한눈에 안 들어온다&rdquo;는 피드백에는
            기능을 붙이지 않고 덜어냈다 — 첫 화면을 &lsquo;오늘 할 진도&rsquo;로.
          </p>
          <div className="pa-rv">
            <ToggleCompare
              a={{ img: '/img/projects/adsp/v1-0-dashboard.png', label: 'v1.0 이전', alt: 'v1.0 대시보드 — 숫자 나열 현황' }}
              b={{ img: '/img/projects/adsp/v1-1-dashboard.png', label: 'v1.1 개선 후', alt: 'v1.1 대시보드 — 비교 막대·과목별 진척' }}
              caption="같은 데이터, 하루 차이 — 숫자 나열에서 비교·추이 시각화로" />
          </div>

          <p className="pa-lead pa-center pa-rv">
            시험 2주 전에는 표기가 무너진 문항들을 고쳐야 했는데,
            <strong> 답안 기록 2,425건이 이미 쌓여 있어</strong> 문항을 갈아끼울 수 없었다.
          </p>
          <Decision
            problem="표기를 고쳐야 하는데 기존 응시 기록이 깨지면 안 된다"
            decision="개정판 두 벌 대신 같은 문항을 제자리 수정 — 선택지 순서·정답 불변을 하드룰로, 위반 시 스크립트가 중단"
            result="전 문항 전수 대조로 정답·선택지 변경 0건 — 기록 손실 없이 표기만 교체" />
          <div className="pa-rv">
            <ToggleCompare
              a={{ img: '/img/projects/adsp/shot-question-before.png', label: '수리 전', alt: '문항 화면 — 표 정렬이 무너진 상태' }}
              b={{ img: '/img/projects/adsp/shot-question-after.png', label: '수리 후', alt: '문항 화면 — 표·코드 정렬 수리 후' }}
              caption="같은 문항의 제자리 수정 — 정답·선택지 순서는 하드룰로 불변" />
          </div>
          <div className="pa-rv"><PromptCard idx={2} /></div>

          <div className="pa-minors">
            <h3 className="pa-sub-h pa-rv">그 사이의 개선들</h3>
            <LogRail />
          </div>
          <div className="pa-rv"><ToolCarousel /></div>
        </section>

        {/* 5 실패 — 안 됐던 것들(원인 분석 동반 — 열거 금지) */}
        <section className="pa-ch pa-ch-wash" id="fail">
          <ChapterHead date="6주 공통" title="안 됐던 것들 — 실패와 한계" />
          <p className="pa-lead pa-center pa-rv">
            성공만 남기면 기록이 아니라 광고가 된다. 6주 동안 <strong>실제로 틀렸던 것</strong>과
            아직 남아 있는 한계 — 각각 원인까지.
          </p>
          <FailCards />
        </section>

        {/* 6 결과·회고 — 합격률(수위 = 오너 확정)·원인 판정·피드백 */}
        <section className="pa-ch" id="result">
          <ChapterHead date="08-08 ~ 08-24" title={`결과 — ${RESULT.headline}, 평균 대비 평가는 보류`} />
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
        </section>

        {/* 7 다음 기수 노트 — 유지/변경 + 방식 판정 + CTA */}
        <section className="pa-ch pa-ch-wash" id="next">
          <ChapterHead date="참조 노트" title="다음 기수 노트 — 유지할 것과 바꿀 것" />
          <p className="pa-lead pa-center pa-rv">
            1기의 결론을 다음 ADsP 기수가 바로 쓸 수 있는 운영 원칙으로 남긴다.
            회고에서 나온 교훈이 <strong>그대로 다음 판의 백로그</strong>다.
          </p>
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

          <h3 className="pa-sub-h pa-rv">이 방식 자체의 판정</h3>
          <div className="pa-rv"><VerdictSplit /></div>

          <div className="pa-cta-block pa-rv">
            {/* 권유형 카피('이 과정을 당신의 프로젝트로') = 오너 삭제 2026-08-15 → 운영 사실 서술로 교체. 대시 표기도 폐지. */}
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
