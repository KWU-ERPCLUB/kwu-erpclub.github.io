// ADsP 인터랙티브 상세 — 핵심 렌더·수치 정합 테스트(고도화 2026-08-13: 레퍼런스 5종 복합 + P-A~C).
// ①챕터 앵커(실패 포함) ②히어로=단일원천 ③도트 필드 정합 ④토글·캐러셀·타일 골격 ⑤실패/판정 콘텐츠
// ⑥보드 링크 0 ⑦재구성 라벨 ⑧타인 실명 0 ⑨목록 연결. 렌더 = renderToString(사이트 표준 — jsdom 없음).
import { expect, test } from 'vitest'
import { renderToString } from 'react-dom/server'
import ProjectAdsp from './ProjectAdsp.jsx'
import { MetricTable, ToolCarousel, BuildLoop, BuildEvidence, BuildPrinciples, CodeStats } from './project-adsp-parts.jsx'
import { DotField, ToggleCompare, FailCards, VerdictSplit, dotLayouts } from './project-adsp-viz.jsx'
import { FlowChain, RoadmapRail, TeamSplit } from './project-adsp-road.jsx'
import { teamCells, axisPos } from './project-adsp-objects.jsx'
import { ROADMAP, ROADMAP_MAJORS, ROADMAP_MINORS } from '../data/project-adsp-roadmap.js'
import {
  HERO_STATS, WEEKLY_ANSWERS, METRICS, CHAPTERS, TOOL_SLIDES, BUILD_STEPS,
  BUILD_PRINCIPLES, CODE_STATS, PROMPTS, FAILS, VERDICT, DOT_SCALE,
  TEAMS, TEAM_EXTRAS, TEXTBOOK, STUDY_FLOW, STACK_FLOW, RESULT, RETRO_POINTS, FEEDBACK_POINTS, NEXT_KEEP, NEXT_CHANGE,
} from '../data/project-adsp-data.js'
import { INTERACTIVE_PAGES } from '../Projects.jsx'

// flat = 주석 제거 + HTML 엔티티 복원(따옴표 포함 문안을 원문 그대로 대조하기 위함)
const flat = (node) => renderToString(node).replace(/<!-- -->/g, '')
  .replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&amp;/g, '&')
const page = flat(<ProjectAdsp />)

test('v2 서사 챕터(기획·구조·학습 설계·제작·로드맵·실패·회고) 전부 앵커 섹션 + 로컬 나브 링크로 렌더', () => {
  for (const id of ['plan', 'team', 'study', 'build', 'roadmap', 'fail', 'retro']) {
    expect(CHAPTERS.map((c) => c.id), `v2 챕터 ${id}`).toContain(id)
  }
  for (const c of CHAPTERS) {
    expect(page, `#${c.id} 섹션`).toContain(`id="${c.id}"`)
    expect(page, `#${c.id} 나브 링크`).toContain(`href="#${c.id}"`)
  }
})

test('보드 링크 0건(로그인 불가) + 히어로 = 스터디 1기 + 제작 축 수치 = 단일원천', () => {
  expect(page).not.toContain('erpstudy.vercel.app')
  expect(page).toContain('ADsP 스터디')
  for (const s of HERO_STATS) {
    expect(page).toContain(s.value)
    expect(page).toContain(s.label)
  }
})

test('도트 필드 — 주별 합 7,976 정합 · 도트 수 = 값/10 합 · 스텝 3 · SSR = 최종 상태(주 라벨·52.7%)', () => {
  expect(WEEKLY_ANSWERS.reduce((a, d) => a + d.value, 0)).toBe(7976)
  const expected = WEEKLY_ANSWERS.reduce((a, d) => a + Math.round(d.value / DOT_SCALE), 0)
  const { scatter, stack } = dotLayouts()
  expect(scatter.length).toBe(expected)
  expect(stack.length).toBe(expected)
  const d = flat(<DotField />)
  expect((d.match(/pa-fdot[ "]/g) || []).length).toBeGreaterThanOrEqual(expected)
  expect(d).toContain('52.7%') // no-JS·reduced-motion에서도 결론이 보인다
  for (const w of WEEKLY_ANSWERS) expect(d).toContain(w.week)
  expect((d.match(/pa-dot-step[ "]/g) || []).length).toBeGreaterThanOrEqual(3)
})

test('토글 비교(E2) — 두 상태 버튼 + 초기 = 개선 후 노출, 페이지에 2회(v1.1·문항 수리)', () => {
  const t = flat(<ToggleCompare
    a={{ img: '/a.png', label: '수리 전', alt: 'a' }}
    b={{ img: '/b.png', label: '수리 후', alt: 'b' }} caption="cap" />)
  expect(t).toContain('수리 전')
  expect(t).toContain('수리 후')
  expect(t).toContain('aria-selected="true"')
  expect((page.match(/pa-tg-frame/g) || []).length).toBe(2)
})

test('실패 챕터(P-A) — 카드 4종 전부 원인·수리 동반 + 판정 2열(P-B) 렌더', () => {
  const f = flat(<FailCards />)
  expect(FAILS).toHaveLength(4)
  for (const x of FAILS) {
    expect(f).toContain(x.title)
    expect(f, `원인 없는 실패 열거 금지: ${x.title}`).toContain(x.cause)
    expect(f).toContain(x.fix)
  }
  const v = flat(<VerdictSplit />)
  expect(v).toContain('통한 조건')
  expect(v).toContain('안 통할 조건')
  for (const t of [...VERDICT.works, ...VERDICT.limits]) { expect(v).toContain(t.k); expect(v).toContain(t.sub) }
})

test('제작 챕터 — 스택 플로우·루프 4단계·투입 실측(P-C)·도구 명시(Opus 5)·원칙 4·발췌·재구성 라벨', () => {
  const sf = flat(<FlowChain items={STACK_FLOW} ariaLabel="t" />)
  for (const t of STACK_FLOW) expect(sf).toContain(t.name)
  const l = flat(<BuildLoop />)
  for (const s of BUILD_STEPS) expect(l).toContain(s.k)
  const cs = flat(<CodeStats />)
  for (const s of CODE_STATS) expect(cs).toContain(s.value)
  expect(page).toContain('Opus 5')
  const pr = flat(<BuildPrinciples />)
  for (const p of BUILD_PRINCIPLES) {
    expect(pr).toContain(p.k)
    expect(pr, `원칙 근거 표기: ${p.k}`).toContain(p.src)
  }
  const e = flat(<BuildEvidence />)
  expect(e).toContain('실물 발췌 · spec 문서')
  expect(e).toContain('실물 발췌 · git 커밋 로그')
  expect(page.split('재구성 예시').length - 1).toBeGreaterThanOrEqual(PROMPTS.length)
})

test('지표 표 — 4종 + 톤 칩(E5) 렌더', () => {
  const m = flat(<MetricTable />)
  for (const x of METRICS) {
    expect(m).toContain(x.key)
    expect(m).toContain(`pa-tone ${x.tone}`)
  }
})

test('로드맵 레일 — major 카드(문제·결정·결과) 전부 + minor 한 줄 전부 + 미디어 슬롯 주입 렌더', () => {
  expect(ROADMAP_MAJORS.length).toBeGreaterThanOrEqual(6)
  expect(ROADMAP_MINORS.length).toBeGreaterThanOrEqual(8)
  expect(ROADMAP.length).toBe(ROADMAP_MAJORS.length + ROADMAP_MINORS.length)
  const r = flat(<RoadmapRail media={{ viz: <p>MEDIA-VIZ</p> }} />)
  for (const n of ROADMAP_MAJORS) {
    expect(r, `major: ${n.title}`).toContain(n.title)
    expect(r, `문제 없는 major 금지: ${n.title}`).toContain(n.problem)
    expect(r).toContain(n.decision)
    expect(r).toContain(n.result)
  }
  for (const n of ROADMAP_MINORS) expect(r, `minor: ${n.date}`).toContain(n.text)
  expect(r).toContain('MEDIA-VIZ')
  // 페이지에서도 major 제목 전부 렌더
  for (const n of ROADMAP_MAJORS) expect(page).toContain(n.title)
})

test('기획·구조·학습 설계 — 베타 취지·팀 블록·교재 재정리 프레이밍·학습 플로우 렌더', () => {
  expect(page, '베타 취지').toContain('베타')
  const team = flat(<TeamSplit />)
  for (const t of TEAMS) {
    expect(team, `팀: ${t.name}`).toContain(t.name)
    expect(team).toContain(t.mode)
  }
  for (const e of TEAM_EXTRAS) expect(page, `공통 장치: ${e.k}`).toContain(e.k)
  expect(page, '표지 이미지').toContain(TEXTBOOK.img)
  expect(page, '저작권 프레이밍(오너 확정)').toContain('원문을 옮겨 싣지 않았다')
  const sf = flat(<FlowChain items={STUDY_FLOW} ariaLabel="s" />)
  for (const t of STUDY_FLOW) expect(sf).toContain(t.k)
  for (const t of STUDY_FLOW) expect(page).toContain(t.k)
})

test('캐러셀 — 슬라이드 전량 + 도트 + 일시정지 버튼(aria-pressed)', () => {
  const c = flat(<ToolCarousel />)
  for (const s of TOOL_SLIDES) expect(c).toContain(s.img)
  expect(c).toContain('aria-pressed="false"')
  expect(c).toContain('자동 전환 일시정지')
})

test('타인 실명 미노출(§5-4) — 렌더 마크업에 스터디원 이름 0건', () => {
  for (const name of ['곽하연', '김채영', '윤정민', '이소은', '이희승', '최성은', '유준혁', '이서정', '백민석', '이가영']) {
    expect(page).not.toContain(name)
  }
})

test('목록 연결 — adsp 슬러그 = 전용 페이지 매핑', () => {
  expect(INTERACTIVE_PAGES['2026-07-24-bapzzi-adsp-board']).toBe('/projects/adsp/')
})

test('회고 — 결과(합격률 50%만)·회고 3장·피드백 3장·다음 기수 노트 렌더', () => {
  expect(page).toContain(RESULT.rate)
  expect(page).toContain(RESULT.headline)
  expect(page, '평가 보류 프레임').toContain('보류')
  for (const r of RETRO_POINTS) expect(page, `회고: ${r.k}`).toContain(r.k)
  for (const f of FEEDBACK_POINTS) expect(page, `피드백: ${f.k}`).toContain(f.k)
  for (const t of [...NEXT_KEEP, ...NEXT_CHANGE]) { expect(page).toContain(t.k); expect(page).toContain(t.sub) }
  expect(page).toContain('다음 기수에도 유지')
  expect(page).toContain('다음 기수에는 바꾼다')
})

test('수치 수위(오너 확정 08-24) — 완주↔합격 교차 수치·문항 총계 미게재', () => {
  expect(page, '교차 수치 금지(소그룹 유추 위험)').not.toContain('명 중 합격 1명')
  expect(page, '교차 수치 금지').not.toContain('완주 5명')
  expect(page, '문항 총계 비게재(저작권 룰)').not.toContain('1,010')
  expect(page, '문항 총계 비게재').not.toContain('1010문항')
})

test('v7 시각 오브젝트 V1~V5 — 페이지 렌더 + 수량 = 데이터 계산(spec 2026-08-24 §3·§7)', () => {
  // V1 아이소타입: 유닛 10, 합격 5
  expect((page.match(/pa-iso-u[ "]/g) || []).length).toBe(10)
  expect((page.match(/pa-iso-u pass/g) || []).length).toBe(5)
  expect(page).toContain('합격률 50%')
  // V2 팀 리듬: 셀 = 주 × 7, 1팀 점 = 주 × 5, 2팀 점 = 주
  const { daily, weekly } = teamCells(WEEKLY_ANSWERS.length)
  expect(daily.length).toBe(WEEKLY_ANSWERS.length * 5)
  expect(weekly.length).toBe(WEEKLY_ANSWERS.length)
  expect((page.match(/pa-tr-dot/g) || []).length).toBe(daily.length + weekly.length)
  // V3 시간축: 노드 = ROADMAP 전량, 날짜 위치 0~1
  expect((page.match(/pa-axis-node/g) || []).length).toBe(ROADMAP.length)
  expect(axisPos('06-26')).toBe(0)
  expect(axisPos('08-08 ~ 10')).toBeLessThan(1)
  expect(axisPos('07-24')).toBeGreaterThan(0.5)
  // V4 도트 필드: 페이지에 포함(dead code 재발 방지 — 검수 A3)
  expect(page).toContain('pa-dotwrap')
  expect(page).toContain('52.7%')
  // V5 지표 간극: 두 지표 + 차이
  expect(page).toContain('pa-gap-scale')
  expect(page).toContain('11.5p')
})

test('v7 골격 규격 — 카드 박스 ≤ 30 · 리빌 스태거 인덱스 존재 · 커밋 로그 = 다크 면(스크롤바 금지는 CSS pre-wrap)', () => {
  const cards = (page.match(/class="(pa-fail|pa-flow-step|pa-loop-step|pa-split-col|pa-road-card|pa-doc|pa-term)[ "]/g) || []).length // pa-prompt = 무테 인용
  expect(cards, `카드 박스 수 ${cards}`).toBeLessThanOrEqual(30)
  expect(page).not.toContain('pa-feat ') // 구 테두리 카드 그리드 폐지
  expect(page).not.toContain('pa-dcell')
  expect((page.match(/--i:/g) || []).length).toBeGreaterThanOrEqual(20)
  expect(page).toContain('git log --oneline')
})

test('v3 카피 규칙 — 대시(—) 금지: 데이터 문안 0건(실물 인용 SPEC·COMMIT_LOG 제외)', () => {
  const pools = [
    ...ROADMAP.flatMap((n) => [n.title, n.problem, n.decision, n.result, n.text]),
    ...RETRO_POINTS.flatMap((x) => [x.k, x.desc]),
    ...FEEDBACK_POINTS.flatMap((x) => [x.k, x.desc]),
    ...[...NEXT_KEEP, ...NEXT_CHANGE, ...VERDICT.works, ...VERDICT.limits].flatMap((x) => [x.k, x.sub]),
    ...TEAMS.flatMap((t) => [t.mode, t.desc]),
    ...FAILS.flatMap((f) => [f.title, f.cause, f.fix]),
    RESULT.frame, TEXTBOOK.note,
  ].filter(Boolean)
  for (const t of pools) expect(t, `대시 발견: ${t}`).not.toContain('—')
})

test('재검수(08-24) — 오너 확정 결정 보존: 스탯 카드 2 · minor 결정 기본 펼침 · 원칙 리스트 가운데 정렬 클래스', () => {
  expect((page.match(/class="pa-hstat"/g) || []).length).toBe(2) // 8명·6주 카드(합격률은 아이소타입)
  expect(page).toContain('class="pa-road-minors" open') // 자잘한 결정 숨김 금지(오너 v2 문안 정합)
  expect(page).toContain('pa-prin-item') // 무테 유지(v7) + CSS 가운데 정렬(오너 상시 규칙)
})
