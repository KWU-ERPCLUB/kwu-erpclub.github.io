// FAQ 단일원천(E4, 2026-08-05 오너 픽) — 메인(/) = 전체, /recruit = recruit:true 서브셋(코딩·비용·관계·모집 시기).
// 원천 1곳: 문항 추가·수정 = 이 파일만. 답변 = 개조식(디자인규칙 §0-1). 질문 = 문답 UI라 구어 유지(예외 승인 범위).
import { RECRUIT, ACADEMIC_RULE, PRIVACY_NOTE, formatWindowShort, CONTACT } from './recruit.js'

// 문의 채널 1줄 — 원천 = CONTACT 상수(이메일 확정 2026-08-05).
const 문의채널 = `문의 = 이메일(${CONTACT.email}) 또는 GitHub 저장소.`

export const FAQ = [
  {
    q: '코딩을 못해도 참여할 수 있나요?',
    a: '가능. 경영학부 대상, 주제는 코딩이 아니라 AI 활용. 필요한 도구 사용법은 스터디에서 함께 다룸.',
    recruit: true,
  },
  {
    q: '챗GPT는 이미 쓰는데, 스터디가 왜 필요한가요?',
    a: '챗 = 단발 질답, 업무 = 반복 프로세스 — 반복에 붙이는 워크플로·자동화가 별도 주제. 같은 도구도 문맥 설계·자료 연결에 따라 결과 차이. 도구 무게중심도 챗 밖(에이전트·업무 도구 내장)으로 이동 중.',
  },
  {
    q: '비용이 드나요?',
    a: '참가비 없음. 무료 도구 스택 기본, 일부 유료 AI 도구는 선택.',
    recruit: true,
  },
  {
    q: '무엇을 만들게 되나요?',
    a: '각자 경영·MIS 맥락의 실물(배포된 웹 결과물) 제작. 결과물은 본인 소유.',
  },
  {
    q: 'ERP연구회와는 어떤 관계인가요?',
    a: 'ERP연구회 산하 스터디. 연구회 안에 SAP 실습·공모전 심화 트랙.',
    recruit: true,
  },
  // 증보 4문항(2026-08-05 2차) — 답변 값은 전부 기존 지면에 이미 있는 것만 재사용:
  // 시간 = RECRUIT_FACTS 모임·RECRUIT_DO 기고·ACADEMIC_RULE / 학점 = 헌장상 자율 스터디 / 개인정보 = RecruitForm 하단 문구
  // / 전공 = RECRUIT_FIT 경영학부 중심. 미확정(선발 기준·정원·결석 정책)은 문항 자체를 만들지 않는다.
  {
    q: '주당 시간이 얼마나 드나요?',
    a: `모임 = 매주 대면 60분 · 개인 산출물 진척 + 주 1건 기고(인사이트 게재)가 주 단위 활동. ${ACADEMIC_RULE}.`,
    recruit: true,
  },
  {
    q: '학점·졸업요건과 관계가 있나요?',
    a: '무관. 교내 학회(ERP연구회) 산하 자율 스터디 — 학점·이수 요건 아님.',
    recruit: true,
  },
  {
    q: '제출한 개인정보는 어떻게 쓰이나요?',
    a: PRIVACY_NOTE,
    recruit: true,
  },
  {
    q: '전공 제한이 있나요?',
    a: '없음. 경영학부 중심 — 전공 무관, 지원 제한 없음.',
    recruit: true,
  },
  {
    q: '언제 모집하나요?',
    a: `${RECRUIT.cohort} 모집 = ${formatWindowShort()}(${RECRUIT.term} 운영). 요강·일정 = 모집(RECRUIT) 페이지. ${문의채널}`,
    recruit: true,
  },
]

// /recruit 아코디언 서브셋 — 모집 관련 문항만(메인 = 전체 렌더).
export const RECRUIT_FAQ = FAQ.filter((f) => f.recruit)
