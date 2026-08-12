// ADsP 1기 인터랙티브 상세의 콘텐츠 단일원천 — 수치 전부 실측(1기-데이터 스냅샷), 개인 단위 없음.
// 서사 구도(오너 픽 2026-08-13): 집중 조명 = MVP 범위·첫 반복·절 재정의·지표 4종·오늘 할 진도·
// 사용법 가이드·데이터 계층 격리·속성 세션·문항 가독성 개편·중요도 배지·읽기전용 잠금. 나머지 = 압축 스트립.
// ⚠저작권 규칙: "자체 제작 문항"·문항 총계 외부 비게재 — 활동 데이터만 쓴다.

export const HERO_STATS = [
  { value: '9,118', label: '누적 답안 기록', src: '시험 당일 마감' },
  { value: '1,268', label: '세트 응시 횟수', src: '정식 8명 합계' },
  { value: '6주', label: '2팀 8명 완주 운영', src: '06-26 ~ 08-08' },
]

// 주(월~일)별 답안 — 정식 8명. 합 = 7,976.
export const WEEKLY_ANSWERS = [
  { week: '6/29~', value: 15 },
  { week: '7/6~', value: 676 },
  { week: '7/13~', value: 782 },
  { week: '7/20~', value: 1006 },
  { week: '7/27~', value: 1290 },
  { week: '8/3~8/8', value: 4207, hot: true }, // 시험 주 — 52.7%
]

// 4지표 pill 탭 — 07-02 지표 체계(혼용 금지) 정의 + 1기 실측.
export const METRICS = [
  {
    key: '정답률', formula: '맞힌 수 ÷ 푼 수 (누적)',
    reading: '정리본을 방금 읽고 푸는 절 퀴즈에선 값이 높게 나온다. 학습 확인용으로만 쓴다.',
    value: '74%', valueLabel: '절 퀴즈 평균(정식 8명)',
  },
  {
    key: '진행도', formula: '완료 일차 ÷ 25',
    reading: '문항 비율(17%)이 체감(8%)과 어긋난다는 신고를 받고 완료 일차 기준으로 교체했다.',
    value: '25.6', valueLabel: '진도 평균(절 기준, /29)',
  },
  {
    key: '실전점수', formula: '전과목 모의·기출만 (없으면 —)',
    reading: '재도전·중도이탈을 걷어낸 첫 시도만 실력 판단에 쓴다.',
    value: '62.5%', valueLabel: '첫 시도 평균 · 응시 5명',
  },
  {
    key: '종합준비도', formula: '(진행도 × 정답률) × 0.8 + 실전 × 0.2',
    reading: '하나의 성취도로 뭉치면 진도 부족과 정확도 부족이 같은 숫자로 보인다. 그래서 넷으로 쪼갰다.',
    value: '4개', valueLabel: '분리 지표 — 혼용 금지',
  },
]

// 마감 캐러셀 — 6주 뒤의 보드. 1번 = 라이브 실측 시퀀스(애니메이션 webp, 2026-08-13 운영자 열람 캡처
// — 이름 블러·읽기 조작만). 나머지 = 1기 당시 실측 스틸(블러본 — 개인 시점 화면은 아카이브 캡처가 원본).
export const TOOL_SLIDES = [
  { img: '/img/projects/adsp/v2-board-home.webp', caption: '메인 — 전원 평균·랭킹·과목별 진척 (실측 화면 자동 전환)' },
  { img: '/img/projects/adsp/shot-d2-progress.png', caption: '진도 — 절 29개·시험주간 안내' },
  { img: '/img/projects/adsp/v1-3-quiz.png', caption: '절 퀴즈 — 한 문제씩, 즉시 해설' },
  { img: '/img/projects/adsp/shot-exam-timer.png', caption: '실전 모드 — 90분 카운트다운·자동 채점' },
  { img: '/img/projects/adsp/shot-d2-me.png', caption: '내정보 — 4지표 카드' },
]

// 집중 조명 외 개선들 — 압축 스트립(빼지 않되 분량 차등, 오너 지시).
export const MINOR_ITEMS = [
  { date: '07-03', text: '정답률을 누적 기준으로 — "다 풀면 100%"가 되던 문제 교정' },
  { date: '07-05', text: '정리본을 끝까지 읽으면 바로 퀴즈로 — 동선 한 단계 단축' },
  { date: '07-05', text: '주간 감독 리포트 시작 — 첫 발견은 "쓰는 사람이 거의 없다" → 온보딩을 최우선 과제로' },
  { date: '07-07', text: '진행도를 완료 일차 기준으로 교체 — 산술은 맞았지만 체감과 어긋났던 지표' },
  { date: '07-16', text: '주차 점검 퀴즈·연속 학습 배지 — 자기 신고 대신 풀어야 완료' },
  { date: '07-16', text: '랭킹 저평가의 진짜 원인 확정 — 조회 1,000행 절단, 페이지네이션으로 수리' },
  { date: '07-26', text: '90분 타이머·응시 전 안내 — "타이머 있나요?"의 원인은 기능이 아니라 시각 위계' },
  { date: '08-03', text: "'안 푼 문제만' 버튼 — 미응시 문항을 골라 푸는 동선 신설" },
  { date: '08-08', text: '시험 당일 데이터 스냅샷을 보드 밖에 분리 보관 — 2기에 덮이기 전에' },
]

export const CHAPTERS = [
  { id: 'start', label: '시작', date: '06-26' },
  { id: 'iterate', label: '반복', date: '06-29' },
  { id: 'structure', label: '구조', date: '07-01' },
  { id: 'adopt', label: '정착', date: '07-03' },
  { id: 'quality', label: '품질', date: '07-11' },
  { id: 'ops', label: '운영', date: '07-24' },
  { id: 'exam', label: '실전', date: '07-26' },
  { id: 'close', label: '마감', date: '08-10' },
]

export const BOARD_URL = 'https://erpstudy.vercel.app'
