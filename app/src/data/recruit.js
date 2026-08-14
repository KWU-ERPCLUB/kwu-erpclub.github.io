import { AIM_TIMELINE } from './aim-roadmap.js'

// AIM 모집 데이터 — 기수·모집 창·활동 일정의 유일 원천(값 원천 = erp-club docs/specs/2026-07-27-aim-운영틀.md §2·§3·§7).
// 국면 전환(home-logic recruitPhase)·메인 모집 밴드·FAQ·모집 페이지 문구가 전부 여기서 파생 →
// 다음 기수 전환·기간 변경 = 이 파일 1곳 수정(표시 문자열 중복 0).
export const RECRUIT = {
  study: 'AIM',
  cohort: '1기',
  term: '2학기',
  window: { start: '2026-08-25', end: '2026-09-08' }, // 모집 창(경계일 포함)
  활동기간: '2026-09 ~ 12 (2학기)',
}

// (구 일정·PHASES 상수 = 2026-08-14 삭제 — 소비처 0 + aim-roadmap.js와 날짜 중복 보유(드리프트 예약).
//  일정·기간 값의 원천 = data/aim-roadmap.js AIM_TIMELINE 1곳.)

// 개인정보 용도 1줄(2026-08-05 2차 일원화) — 신청 폼 하단·FAQ가 같은 값을 쓴다(표시 문자열 중복 0).
export const PRIVACY_NOTE = '제출한 정보는 모집 연락·기수 운영에만 사용하고, 그 외 용도로는 쓰지 않습니다.'

// 학사일정 연동 원칙(운영틀 개정 2026-08-05 명문화) — 활동 안내 공용 1줄(사실 서술·개조식).
export const ACADEMIC_RULE = '광운대 학사일정 연동 — 시험(중간·기말) 2주 전부터 활동 중지'

// ── 연락 채널 단일원천(2026-08-05 일원화 · 같은 날 저녁 이메일 확정 — 오픈채팅 대체) ──
// 문의를 언급하는 전 위치(모집 페이지 문의·신청 폼 안내·FAQ·워크스페이스)가 이 상수만 참조한다.
// 이양 시 공용 계정으로 교체 예정(개인 학교 메일 = 1기 한시) — 교체 지점 = 이 상수 1곳.
export const CONTACT = {
  email: 'win7374@kw.ac.kr',
  githubUrl: 'https://github.com/KWU-ERPCLUB/kwu-erpclub.github.io',
}
export const CONTACT_MAILTO = `mailto:${CONTACT.email}`

// 'AIM 1기' — 기수 전체 표기(밴드·로그·모집 페이지 공용).
export const COHORT_LABEL = `${RECRUIT.study} ${RECRUIT.cohort}`

// 'YYYY-MM-DD' → 'MM-DD'(같은 해 두 번째 날짜·짧은 표기용).
export function shortDate(ymd) {
  return String(ymd).slice(5)
}

// ── /recruit 페이지 정적 카피(2026-08-05 v3.1 개조 때 Recruit.jsx에서 이관 — 300줄 규격) ──
// 값 파생 = 위 RECRUIT·아래 AIM_ROADMAP(운영틀 §2·§3·§7)만. [미정] 게재 금지·개조식 사실 서술 유지.

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

// 이런 분을 찾습니다(오너 2026-08-07 2차 — 영문 키워드 반려: 한국 현업 모집공고의 자격 요건 문법·체크리스트 형태).
export const RECRUIT_FIT = [
  ['전공 무관', '경영학부 중심 — 학과·학년 지원 제한 없음.'],
  ['코딩 경험 무관', '주제 = 코딩이 아니라 AI 활용. 도구 사용법은 스터디에서 함께 다룸.'],
  ['주 1회 참여 가능', '매주 대면 60분 — 요일은 참가자 조율로 확정.'],
  ['직접 만들어 볼 의지', '본인 반복 작업(수업·과제·시험공부)의 자동화를 직접 만들어 보고 싶은 사람.'],
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
// 사실 정정(검수 2026-08-13): '전부 접속 가능' 삭제(보드 = 로그인 벽) · 문항 총계 삭제(저작권 규칙 —
// 외부 비게재) · 보드 상태 = 1기 종료·읽기전용 아카이브 · 보드 href = 인터랙티브 상세(기록 페이지)로.
export const SHOWCASE_LEAD = '코딩을 배워 만든 것이 아니라 AI에 시켜 만든 결과물.'
// 카드 문안 2단(오너 2026-08-07): core = 핵심 한 문장(강조 표기) / sub = 회색 한 줄 보조 설명.
export const RECRUIT_SHOWCASE = [
  {
    name: 'ADsP 진도 보드',
    core: '스터디 1기 운영에 실제로 쓴 진도·성취도 웹앱',
    sub: '답안 9,118건 · 8명 6주 — 1기 종료, 읽기전용 아카이브. 만든 과정은 기록 페이지에.',
    href: '/projects/adsp/',
    img: '/img/projects/adsp-board.png',
  },
  {
    name: '이 허브 사이트',
    core: 'AI 인사이트·워크스페이스가 도는 지면',
    sub: '지금 보고 있는 이 사이트 — AI로 제작·운영',
    href: '/',
    img: '/img/projects/erpclub-site.png',
  },
  {
    name: '세미나 1회차 자료',
    core: '질문에서 위임으로 — AI 활용 구조 3단',
    sub: '발표자료 45장 — 세미나 페이지 게재',
    href: '/seminars/?p=2026-07-25-bapzzi-question-to-delegation',
    img: '/slides/s1/thumb-1.png',
  },
]

// (모집 일정 타임라인 RECRUIT_TIMELINE = 오너 삭제 2026-08-07 — 「접수부터 활동 시작까지」 섹션 폐지)

// AIM 1기 로드맵 — 원천 = data/aim-roadmap.js AIM_TIMELINE(2026-08-14 일원화 — 워크스페이스 로드맵과 완전 동일 값,
// 로드맵 개정 = 그 파일 1곳 수정). 여기서는 공개 표기로만 변환: 모집 구간 제외(모집 페이지 자체가 모집) ·
// 번호 2자리 · 공개설명 우선. 게재 규칙([미정] 금지·내부 설계 미게재)은 원천 파일이 보장.
export const AIM_ROADMAP = AIM_TIMELINE
  .filter((n) => !n.내부전용)
  .map((n) => (n.type === 'phase'
    ? { type: 'phase', 라벨: n.라벨, 기간: n.기간, 설명: n.공개설명 || n.설명, hl: n.hl }
    : { type: 'session', no: String(n.no).padStart(2, '0'), 태그: n.태그, 주: n.주, 주제: n.주제, 배움: n.배움, 세부: n.세부 }))

// '2026-08-25 ~ 2026-09-08' — 요강 등 전체 표기.
export function formatWindow(win = RECRUIT.window) {
  return `${win.start} ~ ${win.end}`
}

// '2026-08-25 ~ 09-08' — 한 줄 문구용 짧은 표기.
export function formatWindowShort(win = RECRUIT.window) {
  return `${win.start} ~ ${shortDate(win.end)}`
}
