// AIM 모집 데이터 — 기수·모집 창·활동 일정의 유일 원천(값 원천 = erp-club docs/specs/2026-07-27-aim-운영틀.md §2·§3·§7).
// 국면 전환(home-logic recruitPhase)·메인 모집 밴드·FAQ·모집 페이지 문구가 전부 여기서 파생 →
// 다음 기수 전환·기간 변경 = 이 파일 1곳 수정(표시 문자열 중복 0).
export const RECRUIT = {
  study: 'AIM',
  cohort: '1기',
  term: '2학기',
  window: { start: '2026-08-25', end: '2026-09-08' }, // 모집 창(경계일 포함)
  활동기간: '2026-09 ~ 12 (2학기)',
  일정: {
    전반: { 기간: '9월 ~ 10월 초', 회차: 5 },
    휴지: { 라벨: '10월 중순', start: '2026-10-06', end: '2026-10-26' },
    후반: { 기간: '10월 말 ~ 12월' },
  },
}

// 1차·2차 프로젝트 일정 — 명명 = 운영틀 「개정 이력 추가(2026-08-05)」(전반부→1차 프로젝트/후반부→2차 프로젝트, 대외 표기).
// 날짜 = 운영틀 §2 시즌 캘린더 산출값만(주간 앵커 = 해당 주 시작일). 최종 발표 주간 = [미정] — 여기에 두지 않는다(게재 금지).
export const PHASES = {
  p1: {
    라벨: '1차 프로젝트',
    형태: '개인 산출물',
    킥오프주간: '2026-09-07',   // §2 킥오프(개강 2주차)
    쇼케이스주간: '2026-10-05', // §2 전반부 마지막 회 = 중간 쇼케이스
    회차: RECRUIT.일정.전반.회차,
  },
  휴지: {
    start: RECRUIT.일정.휴지.start,
    end: RECRUIT.일정.휴지.end,
    중간고사: { start: '2026-10-20', end: '2026-10-26' }, // §2 학사일정(사실)
  },
  p2: {
    라벨: '2차 프로젝트',
    형태: '팀',
    개시주간: '2026-10-27',     // §2 후반부 개시(주제 발표·팀 편성)
    상한주간: '2026-11-23',     // 기말(12-08) 2주 전 활동 중지 → 상한
    기말고사: { start: '2026-12-08', end: '2026-12-14' }, // §2 학사일정(사실)
  },
}

// 학사일정 연동 원칙(운영틀 개정 2026-08-05 명문화) — 활동 안내 공용 1줄(사실 서술·개조식).
export const ACADEMIC_RULE = '광운대 학사일정 연동 — 시험(중간·기말) 2주 전부터 활동 중지'

// ── 연락 채널 단일원천(2026-08-05 일원화) ──
// 단톡방을 언급하는 전 위치(모집 페이지 문의·신청 폼 안내·FAQ·워크스페이스)가 이 상수만 참조한다.
// kakaoOpenChatUrl = 빈 값(오너 제공 대기) — 빈 값이면 링크 대신 KAKAO_PENDING 문구를 렌더(깨진 링크 금지),
// 값이 채워지면 같은 자리에서 자동으로 링크로 전환된다.
export const CONTACT = {
  kakaoOpenChatUrl: '',
  githubUrl: 'https://github.com/KWU-ERPCLUB/kwu-erpclub.github.io',
}
export const KAKAO_PENDING = '단톡방 링크 = 모집 시작 전 공개'
export function hasKakaoChat() {
  return Boolean(CONTACT.kakaoOpenChatUrl)
}

// 'AIM 1기' — 기수 전체 표기(밴드·로그·모집 페이지 공용).
export const COHORT_LABEL = `${RECRUIT.study} ${RECRUIT.cohort}`

// 'YYYY-MM-DD' → 'MM-DD'(같은 해 두 번째 날짜·짧은 표기용).
export function shortDate(ymd) {
  return String(ymd).slice(5)
}

// ── /recruit 페이지 정적 카피(2026-08-05 v3.1 개조 때 Recruit.jsx에서 이관 — 300줄 규격) ──
// 값 파생 = 위 RECRUIT·PHASES(운영틀 §2·§3·§7)만. [미정] 게재 금지·개조식 사실 서술 유지.

// 요강 — 인원·모임·대상 개정 = 오너 확정 2026-08-05(인원 미정, 요일 추후 확정, 경영학부 중심 명시).
export const RECRUIT_FACTS = [
  ['스터디', `${RECRUIT.study} — ERP연구회 산하 MIS·AI 스터디`],
  ['대상', '경영학부 중심 — 전공 무관'],
  ['인원', '미정 — 추후 확정'],
  ['모집 기간', formatWindow()],
  ['활동 기간', RECRUIT.활동기간],
  ['모임', '매주 대면 60분 — 요일 추후 확정'],
  ['비용', '참가비 없음 — 무료 도구 기준(유료 도구 = 개인 선택)'],
]

// 이런 사람(E2) — 자격·지향 사실 서술 4카드(권유형 수사 금지).
export const RECRUIT_FIT = [
  ['경영학부 중심', '전공 무관 — 지원 제한 없음.'],
  ['코딩 경험 불필요', '주제 = 코딩이 아니라 AI 활용. 도구 사용법은 스터디에서 함께 다룸.'],
  ['매주 대면 60분', '주 1회 교내 모임 참여 가능 전제 — 요일은 참가자 조율로 확정.'],
  ['AI 활용 직접 실험', '본인 반복 작업(수업·과제·시험공부)의 자동화를 직접 만들어 보는 사람.'],
]

// 이 스터디가 하는 일(v3.2 2026-08-05 — 구 운영 증빙 블랙 밴드 대체: 신생 스터디 = 증빙 무의미 → 활동 사실 서술).
// 활동 4종 = 오너 지시(2026-08-05 v3.2). 개조식·권유형 금지 — 카드 문법은 rc-fit 승계.
export const RECRUIT_DO = [
  ['AI 인사이트 나누기', '각자 관심 소재를 AI로 정리 — 주 1건 기고, 인사이트 페이지 게재.'],
  ['세미나', '기고에서 관련 주제가 모이면 세미나로 진행 — 회차 기록은 세미나 페이지 축적.'],
  ['AI 효율화 산출물 제작', '본인 학업·과제에 도움되는 자동화 산출물 제작 — 만든 것을 계속 쓰는 구조.'],
  ['팀 프로젝트 — 2차', '2차 구간 — 팀 단위 프로젝트, 경영·업무 맥락 주제.'],
]

// SHOWCASE(2026-08-05 2차) — 스터디가 실제로 만든 실물 3건. 값 = 이미 사이트에 존재하는 사실만
// (프로젝트 md 수치·세미나 frontmatter·라이브 URL). 새 사실·미검증 수치 추가 금지.
export const SHOWCASE_LEAD = '코딩을 배워 만든 것이 아니라 AI에 시켜 만든 결과물 — 전부 접속 가능.'
export const RECRUIT_SHOWCASE = [
  {
    name: 'ADsP 진도 보드',
    fact: '스터디 1기 운영 도구 — 진도·성취도 웹앱, 문항 919(2026-07-26 기준).',
    href: 'https://erpstudy.vercel.app',
    img: '/img/projects/adsp-board.png',
  },
  {
    name: '이 허브 사이트',
    fact: 'AI 인사이트 집계·세미나 기록·워크스페이스가 도는 지면 — 지금 보고 있는 사이트.',
    href: '/',
    img: '/img/projects/erpclub-site.png',
  },
  {
    name: '세미나 1회차 자료',
    fact: '질문에서 위임으로 — AI 활용 구조 3단, 발표자료 45장.',
    href: '/seminars/?p=2026-07-25-bapzzi-question-to-delegation',
    img: '/slides/s1/thumb-1.png',
  },
]

// 모집 일정(E1) — 확정 단계만(선발 방식 미정 → 단계 날조 금지).
const 시작월 = RECRUIT.일정.전반.기간.split(' ')[0] // '9월'
export const RECRUIT_TIMELINE = [
  {
    era: `서류 접수 · ${formatWindow()}`,
    title: '신청 폼 제출',
    desc: '이 페이지 하단 폼에서 온라인 제출 — 기간 내 접수분만 유효.',
  },
  {
    era: '접수 마감 후',
    title: '개별 안내',
    desc: '접수 정보 기준 개별 연락 — 이후 절차는 연락 시 안내.',
  },
  {
    era: `활동 시작 · ${시작월}`,
    title: `${RECRUIT.study} ${RECRUIT.cohort} 활동 개시`,
    desc: `첫 회차 = ${PHASES.p1.라벨} 킥오프(${shortDate(PHASES.p1.킥오프주간)} 주간, 소재 선정) — 활동 기간 ${RECRUIT.활동기간}.`,
  },
]

// 활동 구성 = 로드맵(v3.2 오너 단순화 2026-08-05 — 세부 서사 폐지, "회차 수 + 회차별 주제 한 줄"만).
// 1차 5회 주제 = 운영틀 §4 회차 표 확정값만([미정] = 체험 도구·과제 소재·주제 풀 게재 금지 유지).
// 2차(팀) 구간 = hl(버건디 포인트) + 예상 시기 표기. 최종 발표 주간 [미정] 게재 금지.
export const RECRUIT_STEPS = [
  {
    era: `${PHASES.p1.라벨} · ${shortDate(PHASES.p1.킥오프주간)} 주간 ~ ${shortDate(PHASES.p1.쇼케이스주간)} 주간`,
    title: `${PHASES.p1.형태} — ${PHASES.p1.회차}회`,
    rounds: ['킥오프 — 소재 선정', 'AI 도구 개괄·체험', '공통 미니과제', '본인 소재 제작', '중간 쇼케이스'],
  },
  {
    era: `시험 휴지 · ${shortDate(PHASES.휴지.start)} ~ ${shortDate(PHASES.휴지.end)}`,
    title: '중간고사 기간 활동 중지',
  },
  {
    era: `${PHASES.p2.라벨} · ${shortDate(PHASES.p2.개시주간)} 주간 ~ ${shortDate(PHASES.p2.상한주간)} 주간 — 예상 시기`,
    title: `${PHASES.p2.형태} 프로젝트 — 경영·업무 맥락`,
    desc: '팀별 주제 선택 — 최종 발표 주간 = 추후 확정.',
    hl: true,
  },
]

// '2026-08-25 ~ 2026-09-08' — 요강 등 전체 표기.
export function formatWindow(win = RECRUIT.window) {
  return `${win.start} ~ ${win.end}`
}

// '2026-08-25 ~ 09-08' — 한 줄 문구용 짧은 표기.
export function formatWindowShort(win = RECRUIT.window) {
  return `${win.start} ~ ${shortDate(win.end)}`
}
