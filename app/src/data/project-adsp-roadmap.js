// ADsP 1기 — 고도화 로드맵 데이터(v2 개편 2026-08-24). 핵심 결정(major) 사이에 자잘한 의사결정(minor)을
// 시간순으로 끼워 넣는다(오너 지시). 전 항목 실측(roadmap·git·감독 리포트 원천). v3 카피 = 대시 금지·짧게.
// major.media = 페이지가 주입하는 시각 자료 슬롯 id.

export const ROADMAP = [
  {
    kind: 'major', date: '06-26 ~ 28', title: 'MVP, 두 기능만 담아 2일 만에 배포',
    problem: '팀이 갈리고 대면이 적어, 카톡만으로는 진도 점검이 안 된다',
    decision: '대시보드를 만들되 진도 체크와 현황판만 먼저. 가입 절차 없이 이름과 PIN으로 입장',
    result: '배포 첫날부터 실사용',
  },
  {
    kind: 'major', date: '06-29', title: '배포 다음 날, 숫자를 그림으로', media: 'viz',
    problem: '숫자 나열로는 누가 앞서고 뒤처지는지 안 보였다',
    decision: '하루 만에 비교 막대와 과목별 진척 시각화로 교체',
    result: '써 보고 바로 고치는 개선 주기가 생겼다',
  },
  { kind: 'minor', date: '07-01', text: '교재 555장을 스캔해 구조 전사. 절 29개 트리가 확정됐다' },
  {
    kind: 'major', date: '07-01 ~ 02', title: '진도 단위는 절 29개, 지표는 4종으로', media: 'metrics',
    problem: "'성취도 82%' 하나로는 진도 부족인지 정확도 부족인지 모른다",
    decision: '최소 단위를 교재의 절로 맞추고, 지표를 4종으로 분리해 화면에서 혼용 금지',
    result: '누가 어디서 막혔는지가 숫자로 보인다',
  },
  { kind: 'minor', date: '07-03', text: '정답률을 누적 기준으로 교정. "다 풀면 100%"가 되던 산식 문제' },
  {
    kind: 'major', date: '07-03 ~ 05', title: "첫 화면을 '오늘 할 진도'로",
    problem: '첫 주간 리포트의 발견, "쓰는 사람이 거의 없다"',
    decision: '기능을 붙이는 대신 덜어냈다. 오늘 범위가 맨 위에, 메인 지표는 5개에서 3개로',
    result: '"오늘 뭐 하지"에 첫 화면이 답한다',
  },
  { kind: 'minor', date: '07-05', text: '정리본을 끝까지 읽으면 바로 퀴즈로. 동선 한 단계 단축' },
  { kind: 'minor', date: '07-07', text: '진행도를 완료 일차 기준으로 교체. 산술은 맞았지만 체감과 어긋났다' },
  { kind: 'minor', date: '07-11', text: 'DB 접근 31곳을 한 계층으로 격리. 고칠 곳이 한 곳이 됐다' },
  { kind: 'minor', date: '07-16', text: '랭킹 저평가의 원인 확정. 조회 1,000행 절단을 페이지네이션으로 수리' },
  { kind: 'minor', date: '07-16', text: '주차 점검 퀴즈와 연속 학습 배지. 자기 신고 대신 풀어야 완료' },
  {
    kind: 'major', date: '07-24', title: '쌓인 기록으로 남은 2주를 재계획',
    problem: '한 팀의 진도가 계획 대비 밀렸다. 남은 2주에 전 범위는 불가',
    decision: '속성 세션으로 1·2과목을 마감하고 3과목은 기출 해설로 병행. 근거는 배점',
    result: '진단 문항에서 오답 복습으로 이어지는 인출 중심 세션',
  },
  {
    kind: 'major', date: '07-26', title: '기록을 깨지 않고 문항 고치기', media: 'fix',
    problem: '표기가 무너진 문항을 고쳐야 하는데, 답안 2,425건이 이미 쌓여 있다',
    decision: '같은 문항을 제자리 수정. 선택지 순서와 정답 불변을 하드룰로, 위반 시 스크립트 중단',
    result: '정답과 선택지 변경 0건, 표기만 교체',
  },
  { kind: 'minor', date: '07-26', text: '실전 세트에 90분 타이머와 응시 전 안내 화면' },
  { kind: 'minor', date: '07-30', text: '절마다 중요도 배지. 버릴 것을 근거와 함께 결정' },
  { kind: 'minor', date: '08-03', text: "'안 푼 문제만' 버튼. 미응시 문항만 골라 푸는 동선" },
  {
    kind: 'major', date: '08-08 ~ 10', title: '마감, 데이터는 남기고 보드는 잠그고', media: 'close',
    problem: '2기가 시작되면 1기 데이터는 덮인다',
    decision: '시험 당일 데이터를 밖에 분리 보관하고, 쓰기 경로를 닫아 읽기전용으로',
    result: '1기의 기록은 이제 덮이지 않는다',
  },
]

export const ROADMAP_MAJORS = ROADMAP.filter((n) => n.kind === 'major')
export const ROADMAP_MINORS = ROADMAP.filter((n) => n.kind === 'minor')
