// FAQ 단일원천(E4, 2026-08-05 오너 픽) — 메인(/) = 전체, /recruit = recruit:true 서브셋(코딩·비용·관계·모집 시기).
// 원천 1곳: 문항 추가·수정 = 이 파일만. 답변 = 개조식(디자인규칙 §0-1). 질문 = 문답 UI라 구어 유지(예외 승인 범위).
import { RECRUIT, formatWindowShort } from './recruit.js'

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
  {
    q: '언제 모집하나요?',
    a: `${RECRUIT.cohort} 모집 = ${formatWindowShort()}(${RECRUIT.term} 운영). 요강·일정 = 모집(RECRUIT) 페이지. 문의 = 스터디 단톡방 또는 GitHub 저장소.`,
    recruit: true,
  },
]

// /recruit 아코디언 서브셋 — 모집 관련 문항만(메인 = 전체 렌더).
export const RECRUIT_FAQ = FAQ.filter((f) => f.recruit)
