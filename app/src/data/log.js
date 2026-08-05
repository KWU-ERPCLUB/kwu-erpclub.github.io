// 운영 로그 데이터 — /log 페이지가 렌더만 하고 값은 전부 여기서 온다.
// 기록 1줄 추가 = 이 파일 1줄 추가(컴포넌트 수정 불필요). 사실 그대로만 — 신규 날조 금지.
import { RECRUIT, COHORT_LABEL, formatWindowShort } from './recruit.js'

// 앞으로의 단계 — [번호, 라벨, 상태클래스, 상태라벨]. 상태 = done/prep/planned(global .status 문법).
export const ROADMAP = [
  ['0', '허브 사이트 구축·배포 (kwu-erpclub.github.io)', 'done', '완료'],
  ['1', `${COHORT_LABEL} 모집 — ${formatWindowShort()} · 킥오프 9월 2주`, 'prep', '모집 준비'],
  ['2', `${COHORT_LABEL} 운영 — 전반 개인 산출물 · 후반 팀 프로젝트(${RECRUIT.term})`, 'planned', '예정'],
  ['3', 'SQLD 스터디', 'planned', '예정'],
  ['4', '심화 — SAP 트랙', 'planned', '예정'],
]

// 체인지로그 — [날짜, [[배지, 배지라벨, '제목 — 설명'], ...]]. 역시간순(최상단 = 최신 = 최종 갱신일).
// 배지: live=신규 / prep=개선 / planned=기록 (허브 배지 문법 재사용).
export const HISTORY = [
  ['2026-07-27', [
    ['live', '신규', '모집 페이지(/recruit) 신설 — AIM 1기 요강·활동 구성 게재. 메인에 모집 공고 밴드 추가.'],
    ['prep', '개선', '스터디 확정 — 이름 AIM(MIS·AI 스터디) · 2학기 1기 · 매주 대면 60분 · 2단계(개인 산출물 → 팀 프로젝트).'],
    ['prep', '개선', '세미나 = AIM 세션 아카이브로 통합 — 회차 기록이 세미나 페이지에 축적되는 구조.'],
  ]],
  ['2026-07-11', [
    ['live', '신규', '운영 기록 페이지(/log) 신설 — 내부형 페이지 1호.'],
    ['prep', '개선', '사이트 역할 개정 — 메인은 소개, 세부 페이지는 내부 기록용으로. 디자인 규칙을 수치 규격(v2)으로 문서화.'],
    ['planned', '기록', 'ADsP 진도 보드 v2.3.1 릴리스(데이터 계층 정리).'],
  ]],
  ['2026-07-10', [
    ['prep', '개선', '통합 허브 개편 배포 — 메인=링크 허브, /about(계보·존재 의의)·/join(모집 안내) 신설.'],
    ['planned', '기록', '참여 안내 방식 보류 — 안내 도구 미확정.'],
    ['live', '신규', '사이트 최초 배포 — GitHub 조직(KWU-ERPCLUB) + Pages, main push 자동 배포.'],
  ]],
]

// 성과 스탯 — [수치, 라벨, 상세].
export const STATS = [
  ['1', '진행 중 스터디', 'ADsP 1기'],
  ['2', '라이브 실물', '진도 보드 · 이 사이트'],
  ['3', '준비·예정 트랙', 'AIM · SQLD · SAP'],
]

// 집계 기준 문구(성과 섹션 각주).
export const STATS_BASIS = '집계 기준: KWU-ERPCLUB · adsp-board 저장소 · 헌장 트랙 레지스트리, 2026-07-27'

// 외부 실물 링크.
export const ADSP_BOARD_URL = 'https://erpstudy.vercel.app'
