// ADsP 1기 인터랙티브 상세의 수치 단일원천 — 전부 실측(2026-08-12 확정).
// 원천 = adsp/1기-데이터/(시험 당일 DB 스냅샷) + DB count. 개인 단위 수치 없음(집계만).
// spec = erp-club/docs/specs/2026-08-12-adsp-인터랙티브-개편.md §7. 성적 대조 = 8/28 후 보강 슬롯.

export const HERO_STATS = [
  { value: '1,010', label: '자체 제작 문항', src: '2026-08-08 DB 실측' },
  { value: '9,118', label: '누적 답안 기록', src: '시험 당일 마감' },
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
    reading: '절 퀴즈 평균 74% — 정리본을 방금 읽고 풀어 부풀려진다. 학습 확인용으로만 쓴다.',
    value: '74%', valueLabel: '절 퀴즈 평균(정식 8명)',
  },
  {
    key: '진행도', formula: '완료 일차 ÷ 25',
    reading: '문항 비율(17%)이 체감(8%)과 어긋난다는 신고로 완료 일차 기준으로 전면 교체했다.',
    value: '25.6', valueLabel: '진도 평균(절 기준, /29)',
  },
  {
    key: '실전점수', formula: '전과목 모의·기출만 (없으면 —)',
    reading: '재도전·중도이탈을 걷어낸 첫 시도만 실력 대리지표로 쓴다.',
    value: '62.5%', valueLabel: '첫 시도 평균 · 응시 5명',
  },
  {
    key: '종합준비도', formula: '(진행도 × 정답률) × 0.8 + 실전 × 0.2',
    reading: '하나의 성취도로 뭉치면 진도 부족과 정확도 부족이 같은 숫자로 보인다 — 그래서 넷으로 쪼갰다.',
    value: '4개', valueLabel: '분리 지표 — 혼용 금지',
  },
]

// 도구 챕터 캐러셀 — 실측 캡처(타인 이름 블러 처리본). 녹화 클립 확보 시 video 슬롯으로 교체.
export const TOOL_SLIDES = [
  { img: '/img/projects/adsp/shot-d2-progress.png', caption: '진도 — 절 29개·시험주간 안내' },
  { img: '/img/projects/adsp/v1-3-quiz.png', caption: '절 퀴즈 — 한 문제씩, 즉시 해설' },
  { img: '/img/projects/adsp/shot-exam-timer.png', caption: '실전 모드 — 90분 카운트다운·자동 채점' },
  { img: '/img/projects/adsp/shot-d2-me.png', caption: '내정보 — 4지표 카드' },
]

// 운영 장치 그리드(7월) — 무엇이/왜.
export const OPS_FEATURES = [
  { title: '주간 감독 리포트', desc: '주간 스냅샷 → 6섹션 고정 템플릿. 첫 주 기준선 "활성 1/8명(운영자 본인뿐)"을 여기서 발견했다.' },
  { title: '진행도 재정의', desc: '산술이 맞아도 체감과 어긋나면 틀린 지표다 — 문항 비율을 버리고 완료 일차 ÷ 25로 교체.' },
  { title: '주차 점검 퀴즈', desc: '수동 체크는 자기 신고라 검증이 안 된다 — 점검일에 그 주 핵심 문항을 풀어야 완료.' },
  { title: '연속 학습 배지', desc: '절 체크·퀴즈·점검 중 하나만 해도 그날 인정 — 매일 접속의 동기.' },
]

// 마감 챕터 — 결과 타일.
export const CLOSE_STATS = [
  { value: '5 / 8', label: '29절 전량 완주', note: '진도 평균 25.6절' },
  { value: '52.7%', label: '시험 주(8/3~8/8) 답안 집중', note: '계획은 25일 분산 — 실제는 벼락치기' },
  { value: '61문항', label: '결함 의심(정답률 30% 미만)', note: '988문항 중 6.2% · 48개가 3과목' },
  { value: '108문항', label: '변별 없음(정답률 95% 이상)', note: '2기 콘텐츠 개편 1순위' },
]

// 2기 개선 3순위 — 실측·피드백 근거.
export const NEXT_ITEMS = [
  '진입 동선을 "오늘 할 일 하나 + 시작 버튼"으로 압축 (피드백: 오늘 몫을 찾아 들어가야 했다)',
  '결함 의심 61문항·무변별 108문항 정리 (문항 단위로 지목 가능)',
  '랭킹·진도율의 존폐 또는 산식 공개 (효용보다 압박·불투명으로 읽힘)',
]

export const CHAPTERS = [
  { id: 'start', label: '시작', date: '06-26' },
  { id: 'tool', label: '도구', date: '06-28' },
  { id: 'pivot', label: '전환', date: '07-01' },
  { id: 'ops', label: '운영', date: '07월' },
  { id: 'data', label: '지표', date: '08-08' },
  { id: 'close', label: '마감', date: '08-10' },
]

export const BOARD_URL = 'https://erpstudy.vercel.app'
