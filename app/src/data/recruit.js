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

// 'AIM 1기' — 기수 전체 표기(밴드·로그·모집 페이지 공용).
export const COHORT_LABEL = `${RECRUIT.study} ${RECRUIT.cohort}`

// 'YYYY-MM-DD' → 'MM-DD'(같은 해 두 번째 날짜·짧은 표기용).
export function shortDate(ymd) {
  return String(ymd).slice(5)
}

// '2026-08-25 ~ 2026-09-08' — 요강 등 전체 표기.
export function formatWindow(win = RECRUIT.window) {
  return `${win.start} ~ ${win.end}`
}

// '2026-08-25 ~ 09-08' — 한 줄 문구용 짧은 표기.
export function formatWindowShort(win = RECRUIT.window) {
  return `${win.start} ~ ${shortDate(win.end)}`
}
