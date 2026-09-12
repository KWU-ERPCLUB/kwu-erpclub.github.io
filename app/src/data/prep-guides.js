// 회차별 준비물 안내 — 공지 탭 고정 공지(코드 렌더, DB 아님)의 단일원천(2026-09-12 오너: "공지 탭 안에, 로드맵에서도 이동").
// 구조 = { id, 회차, title, lead, groups[{ label, items[] }], note }. item = { id, icon, title, what, need?[], cards?[], steps[], tips? }.
// 문장 규칙(2026-09-12 오너 재지적 "AI 톤으로 맞추지 마" / 9-13 "숫자 붙으면 줄 바꿔라, 시간 붙이지 마라, 텍스트만 딱딱하다"):
//   · 묶음 라벨 = 하는 일 이름(명사) — 재촉형("지금 바로"·"오늘 안에") 금지 · 소요 시간 표기 없음
//   · title = 명사형 18자 안 · what = 2문장(정의 "X는 Y" + "우리는 Z에 쓴다") · need = 칩 배열(한 항목 = 한 칩)
//   · steps = 한 줄에 동작 하나, 40자 안, 명사형 종결("…누르기"), 마침표 없음 · 나열은 줄로 나눈다
//   · tips = 조건문 한 줄씩 · 추임새("끝", "성공", "꼭") 금지 · 대시(—) 금지
// 화면 요소 표기(PrepNotice.jsx Inline이 모양으로 그린다 — 2026-09-13 시각화):
//   [[버튼 이름]] = 버튼 칩 · {{메뉴 › 경로}} = 경로 칩(› 구분) · <<입력값>> = 입력창 · ((Ctrl+Alt+I)) = 키캡(+ 구분)
//   단계 문자열이 URL로 시작하면 사이트 카드(도메인 + 열기)로 그리고 나머지 글이 옆에 붙는다.
// 새 회차 = 객체 1개 추가.

export const PREP_GUIDES = [
  {
    id: 'ot-prep',
    회차: 1,
    title: 'OT 준비물 7가지',
    date: '2026-09-14',
    lead: '항목을 누르면 하는 법이 옆에 열린다. 완료 표시는 이 기기에만 남는다.',
    note: '이미 돈 내고 쓰는 도구는 그대로 쓴다. ChatGPT Plus는 파일 작업, Claude Pro는 Claude Code나 Cowork로 일을 시키는 용도, Cursor도 같은 용도. GitHub 계정은 전원 필수, 검수는 만든 것과 다른 AI로.',
    groups: [
      {
        label: '계정',
        items: [
          {
            id: 'pw', icon: 'key', title: '비밀번호 바꾸기',
            what: '워크스페이스 계정은 지금 전원이 같은 초기 비밀번호(000000)다. 바꿔야 내 계정이 된다.',
            steps: [
              'https://kwu-erpclub.github.io/workspace/ 접속',
              '<<학번>> <<000000>> 으로 로그인',
              '{{내정보}} 누르기 (폰은 아래쪽 탭)',
              '{{설정 › 비밀번호 변경}} 펼치기',
              '<<새 비밀번호>> 두 번 입력 (6자 이상)',
              '[[저장]]',
            ],
            tips: ['잊어버리면 운영진(신해원)이 000000으로 되돌려 준다.'],
          },
        ],
      },
      {
        label: '신청',
        items: [
          {
            id: 'gemini', icon: 'spark', title: 'Gemini 학생 무료 신청',
            what: 'Gemini(제미나이)는 구글의 AI 챗봇이고, 유료 요금제 AI Plus를 대학생은 1년 무료로 준다. 우리는 시험 공부 정리와 자료 요약에 쓴다.',
            need: ['구글 계정', '학교 이메일(@kw.ac.kr) 또는 학생증 사진', '카드'],
            steps: [
              'https://gemini.google/kr/students/ 접속',
              '[[학생 인증]] 누르기 (SheerID 인증 화면)',
              '<<광운대학교>> <<이름>> <<학교 이메일>> 입력',
              '학교 메일로 온 인증 링크 누르기 (또는 학생증 사진 올리기)',
              '결제수단 등록 (1년 동안 청구 없음)',
              'Gemini 화면 왼쪽 위 "AI Plus" 표시 확인',
            ],
            tips: [
              '카드가 없으면 5단계에서 멈추고 무료 Gemini(https://gemini.google.com)로 시작한다. 스터디 진행에는 차이 없다.',
              '1년 뒤 자동으로 유료가 된다. 오늘 날짜 + 1년을 폰 캘린더에 "Gemini 해지 확인"으로 적어 둔다.',
              '신청 마감 2026-12-31.',
            ],
          },
          {
            id: 'github', icon: 'folder', title: 'GitHub 계정·학생 혜택',
            what: 'GitHub(깃허브)는 파일을 팀과 함께 올리고 누가 언제 무엇을 바꿨는지 자동으로 남는 온라인 공용 폴더다. 팀 프로젝트 공용 폴더가 여기라서 전원 필수이고, 학생 인증을 하면 유료 기능을 무료로 준다.',
            need: ['평소 쓰는 이메일', '학교 이메일(@kw.ac.kr)', '학생증 사진(요구할 때만)'],
            steps: [
              'https://github.com/signup 접속',
              '<<이메일>> <<비밀번호>> <<아이디(영문)>> 입력',
              '이메일로 온 <<인증 코드>> 입력',
              '오른쪽 위 내 사진에서 {{Settings › Emails}} 열기',
              '[[Add email address]]에 학교 이메일 추가',
              '학교 메일함의 인증 링크 누르기',
              'https://education.github.com/pack 접속',
              '[[Sign up for Student Developer Pack]] 누르기',
              '<<Kwangwoon University>> 입력, 학교 이메일 선택',
              '학생증 사진 요구 시 올리기',
            ],
            tips: [
              '승인 메일은 며칠에서 최대 4주 뒤에 온다. 그동안은 아래 Copilot 무료로 쓴다.',
              '승인되면 Copilot이 자동으로 Pro로 바뀐다. 따로 할 일 없음.',
            ],
          },
          {
            id: 'copilot', icon: 'bot', title: 'Copilot 무료 켜기',
            what: 'Copilot(코파일럿)은 GitHub가 주는 AI 비서다. 글과 코드를 대신 쓰고 파일을 읽어 정리한다. 학생 혜택 승인 전에도 무료 버전을 바로 쓴다.',
            need: ['GitHub 로그인 상태'],
            steps: [
              'https://github.com/features/copilot 접속',
              '[[Get started for free]] 누르기',
              '요금제에서 [[Free]] 선택 (카드 불필요)',
              '오른쪽 위 내 사진에서 {{Settings › Copilot}} 열기',
              '"Copilot Free" 표시 확인',
            ],
            tips: ['무료 한도는 한 달에 자동 완성 2,000번, 채팅 50번. 학생 혜택이 승인되면 한도가 없어진다.'],
          },
        ],
      },
      {
        label: '설치',
        items: [
          {
            id: 'vscode', icon: 'window', title: 'VS Code + Copilot',
            what: 'VS Code(브이에스 코드)는 마이크로소프트가 무료로 주는 글 편집 프로그램이다. 메모장의 강한 버전이고, 우리는 여기에 Copilot을 붙여 문서 정리와 반복 작업 자동화에 쓴다. 코딩은 몰라도 된다.',
            need: ['노트북(윈도우·맥 어느 쪽이든)', 'GitHub 계정'],
            steps: [
              'https://code.visualstudio.com/ 접속',
              '[[Download]] 누르기 (운영체제 자동 선택)',
              '받은 파일 열어 설치, 물어보는 건 전부 기본값',
              'VS Code 실행',
              '왼쪽 세로 막대의 네모 4개 아이콘 {{Extensions}} 누르기',
              '검색창에 <<GitHub Copilot>> 입력',
              'GitHub가 만든 것 [[Install]] 누르기',
              '오른쪽 아래 [[Sign in]] 알림 누르기',
              '브라우저에서 GitHub 로그인 후 [[Authorize]] 누르기',
              '오른쪽 위 Copilot 아이콘 누르기 ((Ctrl+Alt+I))',
              '채팅창에 <<안녕, 넌 뭘 할 수 있어?>> 입력해 답 확인',
            ],
            tips: [
              '맥 단축키는 ⌘⌃I.',
              '한국어 메뉴를 원하면 확장 검색창에 Korean Language Pack 입력 후 Install, 오른쪽 아래 "다시 시작" 누르기.',
              '막히면 OT 때 같이 한다. 설치 파일만 받아 온다.',
            ],
          },
          {
            id: 'notebooklm', icon: 'note', title: 'NotebookLM + 검수 계정',
            what: 'NotebookLM(노트북엘엠)은 구글의 공부 도구다. 내 PDF·강의 슬라이드·녹음을 올리면 그 자료만 보고 답하기 때문에 시험 공부에 맞고, 구글 계정만 있으면 무료다.',
            need: ['구글 계정'],
            steps: [
              'https://notebooklm.google/ 접속, 구글 계정으로 로그인',
              '[[새 노트북]] 만들기',
              'PDF 하나 올리기 (강의 자료가 없으면 아무 문서)',
              '채팅창에 <<이 자료를 세 줄로 요약해 줘>> 입력해 답 확인',
              'https://claude.ai/ 또는 https://chatgpt.com/ 중 하나 무료 가입 (검수용, 이미 있으면 그대로)',
            ],
            tips: ['AI가 만든 결과는 다른 AI로 한 번 더 확인하는 게 스터디 규칙이다. Gemini로 만든 건 Claude나 ChatGPT로, ChatGPT로 만든 건 Gemini로 확인한다.'],
          },
        ],
      },
      {
        label: '제출',
        items: [
          {
            id: 'materials', icon: 'doc', title: '재료 4가지 적어 제출',
            what: '회차 2(9/21)에서 각자 과목을 놓고 어디를 AI로 줄일지 같이 본다. 그 재료 4가지를 미리 적어 낸다. 한 줄씩이면 된다.',
            cards: [
              { title: '이번 학기 과목 목록', example: '경영정보시스템, 회계원리, 영어회화' },
              { title: '과목별 자료 형태', example: 'PDF 슬라이드 / PPT / 녹음 / 교재만' },
              { title: '시험 방식', example: '객관식 / 서술형 / 과제 대체 / 팀 발표' },
              { title: '매주 반복하는 귀찮은 일 1개', example: '강의 슬라이드를 노션에 옮겨 적기, 조별 회의록 정리' },
            ],
            steps: [
              'https://docs.google.com 접속',
              '[[새 문서]] 만들기',
              '4가지 적기',
              '오른쪽 위 [[공유]] 누르기',
              '"제한됨"을 {{링크가 있는 모든 사용자}}로 변경',
              '[[링크 복사]]',
              '워크스페이스 {{홈 › 과제 › 회차 2 재료 4가지}} 열기',
              '링크 붙여넣고 [[제출]]',
            ],
            tips: [
              '마감 9/21(월) 18:00.',
              '노션 등 다른 도구도 된다. 링크를 열었을 때 로그인 없이 보이기만 하면 된다.',
              '링크 제출이 어려우면 당일 노트북에 열어 온다.',
            ],
          },
        ],
      },
    ],
  },
]

export const guideItems = (guide) => guide.groups.flatMap((g) => g.items)
export const guideForSession = (no) => PREP_GUIDES.find((g) => g.회차 === Number(no)) || null
export const guideHref = (guide) => `/workspace/?tab=공지&notice=${encodeURIComponent(guide.id)}`
