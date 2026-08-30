---
title: 화면 밖으로 나간 에이전트 — 앤스로픽이 장비 조작 규격을 열었다
author: bapzzi
date: 2026-08-31
시각: 05:40
source_url: https://www.anthropic.com/news/model-hardware-standard-research-preview
source_name: Anthropic · CNBC · 와우테일
성격: 심층 분석
주제: 에이전트
설명: 8월 27일 앤스로픽이 AI 에이전트가 현미경·로봇팔 같은 물리 장비를 조작하는 공용 규격 '모델 하드웨어 표준(MHS)' 리서치 프리뷰를 공개했다. 얼리 액세스 명단에 두산로보틱스가 들어갔고, 국내 제조 AX·로봇 안전 규제와 어디서 만나는지 짚는다
태그: [앤스로픽, MHS, MCP, 로봇, 제조AX]
지금써먹기: false
---

::: 요약
- 8월 27일 앤스로픽이 AI 에이전트가 현미경·액체취급기·로봇팔 같은 물리 장비를 조작하는 공용 규격 '모델 하드웨어 표준(MHS)'의 리서치 프리뷰를 공개했다.
- 성격 = 소프트웨어 도구 연결 규격인 MCP를 장비 쪽으로 넓힌 것. 클로드 전용이 아니라 모델 중립으로 설계됐고, 오픈소스 공개를 예고했다.
- 얼리 액세스 명단에 **두산로보틱스**·유니버설 로봇·제넨텍·AWS·허깅페이스 등이 들어갔다.
- 국내 접점은 제조 AI 전환이다. 산업부 M.AX 얼라이언스 점검에서 42개 사업장 생산성 **30.1% 상승**·불량률 **15.5% 감소가** 보고됐다. 다만 로봇 작업영역 안전 규제는 별도 관문이다.
:::

## 무슨 일 — 8월 27일, 장비를 향한 공용 규격

앤스로픽이 8월 27일 '모델 하드웨어 표준(Model Hardware Standard, MHS)'의 리서치 프리뷰를 공개했다([Anthropic](https://www.anthropic.com/news/model-hardware-standard-research-preview)).

대상은 프로그래밍 가능한 인터페이스를 가진 장비 전반이다. 과학 연구·첨단 제조에서 쓰는 기기가 1차 범위로 제시됐다([CNBC](https://www.cnbc.com/2026/08/27/anthropic-pushes-into-physical-world-with-new-standard-to-help-ai-agents-operate-machines.html)).

공동 개발처는 HHMI 재닐리아 리서치 캠퍼스다. 이곳 아렌스 랩에서는 벤더 프로그램 7개를 정해진 순서로 띄워야 했던 현미경 장비 묶음이 대시보드 클릭 한 번으로 정리됐다는 사례가 소개됐다([Anthropic](https://www.anthropic.com/news/model-hardware-standard-research-preview)).

앤스로픽은 장비에 AI를 붙이는 데 걸리던 수 주–수 개월이 수 시간–수 분 단위로 줄어든다고 밝혔다([Fortune](https://fortune.com/2026/08/27/anthropic-makes-first-move-into-physical-ai-with-universal-standard-for-scientists-manufacturing/)). *벤더가 제시한 수치이므로 독립 검증 결과는 아니다.*

얼리 액세스 참여 조직으로는 제넨텍, 카네기멜런대, 큐에라(QuEra), 유니버설 로봇, AWS, **두산로보틱스**, 다나허, 허깅페이스가 거명됐다([Fortune](https://fortune.com/2026/08/27/anthropic-makes-first-move-into-physical-ai-with-universal-standard-for-scientists-manufacturing/) · [와우테일](https://wowtale.net/2026/08/29/263648/)).

현재 단계는 선별 조직 대상 리서치 프리뷰다. 앤스로픽은 연구 결과와 안전 지침을 함께 붙여 표준을 오픈소스로 공개할 계획이라고 밝혔다([Anthropic](https://www.anthropic.com/news/model-hardware-standard-research-preview)).

앤스로픽에서 이 영역을 맡은 엘리자베스 켈리는 "과학을 위해 만들었지만 기업과 산업 쪽 효용도 크다"는 취지로 말했다([CNBC](https://www.cnbc.com/2026/08/27/anthropic-pushes-into-physical-world-with-new-standard-to-help-ai-agents-operate-machines.html)).

## 왜 지금 — 소프트웨어 쪽 배선이 먼저 끝났다

배경은 앞선 2년의 결과다. 모델과 소프트웨어 도구를 잇는 문제는 MCP¹라는 공용 규격으로 대체로 정리됐다.

정리된 정도가 거버넌스 이관으로 나타났다. MCP는 리눅스재단 산하 에이전틱 AI 재단(AAIF)의 창립 프로젝트로 넘어갔고, 구글의 에이전트 간 통신 규격 A2A도 8월에 같은 재단으로 들어왔다([Forbes](https://www.forbes.com/sites/janakirammsv/2026/08/19/agent2agent-joins-the-agentic-ai-foundation-alongside-mcp/) · [Linux Foundation](https://www.linuxfoundation.org/press/linux-foundation-announces-the-formation-of-the-agentic-ai-foundation)).

남은 쪽이 장비다. 실험실·공장 기기는 제조사마다 제어 방식이 다르고, 문서가 종이 매뉴얼이거나 담당자 두어 명의 머릿속에만 있는 경우가 흔하다. 재닐리아의 프로그램 7개가 그 상태를 보여 주는 사례다.

정리하면 병목이 모델 성능에서 연결 방식으로 옮겨간 자리에 이번 규격이 놓였다.

::: 용어
MCP | 모델 컨텍스트 프로토콜 — 모델이 외부 소프트웨어 도구·데이터에 접근하는 연결 규격. 2024년 앤스로픽이 공개해 업계 공용으로 굳었다
:::

## 개념 정리 — 규격은 세 층으로 쌓인다

MHS가 새로 만든 것은 모델이 아니라 중간층이다. 구조는 아래처럼 나뉜다.

| 층 | 하는 일 | 없으면 생기는 일 |
|---|---|---|
| 장비 드라이버 | 제조사별 제어 방식을 공통 명령으로 번역 | 장비마다 연동 코드를 새로 짬 |
| 프로토콜 | 그 드라이버를 MCP로 노출 | 특정 모델·도구에서만 접근 가능 |
| 안전 | 속도·각도 등 운전 한계를 규격 안에 고정 | 안전 판단을 모델의 그때그때 판단에 맡김 |

드라이버 층의 실제 동작은 단순하다. 표준 드라이버가 컴퓨터 운영체제와 장비 사이에서 '읽기'·'쓰기' 같은 기본 명령으로 번역한다([CNBC](https://www.cnbc.com/2026/08/27/anthropic-pushes-into-physical-world-with-new-standard-to-help-ai-agents-operate-machines.html)).

여기에 장비를 자연어 태그로 기술해, 모델이 "3번 현미경" 같은 말로 대상을 찾을 수 있게 하는 방식이 함께 소개된다([kingy.ai 해설](https://kingy.ai/blog/anthropic-model-hardware-standard-mhs/)).

안전 층의 설계 의도는 규격 자체에 제약을 박아 넣는 것으로 알려졌다. 모델이 아무리 그럴듯한 명령을 만들어도 미리 정한 범위 밖으로는 장비가 움직이지 않게 한다는 설명이다([kingy.ai 해설](https://kingy.ai/blog/anthropic-model-hardware-standard-mhs/)).

*이 구조가 담는 것은 성능이 아니라 배선과 한계선이다.* 무엇을 할 수 있는지보다 무엇을 못 하게 할지가 규격의 내용이다.

## 다른 흐름과의 연관

**첫째, 규제 시계가 먼저 와 있다.** 유럽연합 기계규정(Regulation (EU) 2023/1230)은 2027년 1월 20일부터 적용된다. 머신러닝 기반으로 스스로 변하는 안전 부품을 처음으로 명시해 제3자 적합성 평가 대상으로 끌어들였다([EU-OSHA](https://osha.europa.eu/en/legislation/directive/regulation-20231230eu-machinery) · [Baker McKenzie 해설](https://www.bakermckenzie.com/en/insight/publications/resources/product-risk-radar-articles/machinery-regulation)).

규격이 안전 한계를 코드 쪽으로 내리는 방향과, 규제가 인증을 요구하는 방향이 같은 시기에 겹쳤다.

**둘째, 국내 제조 AI 전환이 이미 진행 중이다.** 산업통상자원부는 M.AX 얼라이언스로 지원한 사업장 중 42곳을 점검해 생산성 **30.1% 상승**, 불량률 **15.5% 감소를** 확인했다고 밝혔다. 참여 기업·기관은 출범 8개월 만에 1500여 곳으로 늘었고, 2030년까지 AI 팩토리 500개 구축이 목표로 제시됐다([대한민국 정책브리핑](https://www.korea.kr/news/policyNewsView.do?newsId=148969347) · [ZDNet Korea](https://zdnet.co.kr/view/?no=20260804133115)).

::: 수치
30.1% | AI 팩토리 지원 42개 사업장의 생산성 향상 | 산업부 M.AX 얼라이언스 점검
15.5% | 같은 42개 사업장의 불량률 감소 | 산업부 M.AX 얼라이언스 점검
500개 | 2030년까지 정부 AI 팩토리 구축 목표 | 산업통상자원부
:::

**셋째, 국내 기업이 규격 초기에 들어가 있다.** 두산로보틱스가 얼리 액세스에 포함됐다. 협동로봇을 만드는 쪽이 규격 초안 단계에 참여하면, 나중에 나오는 제품이 그 규격을 기본으로 달고 나올 가능성이 생긴다.

AWS는 로봇 연결 라이브러리(Strands Robots), 허깅페이스는 로보틱스 라이브러리(LeRobot) 쪽으로 붙었다고 소개된다([와우테일](https://wowtale.net/2026/08/29/263648/)).

**넷째, 표준 경쟁의 형태다.** 소프트웨어에서 MCP가 그랬듯, 장비 쪽에서도 먼저 공개된 규격이 사실상 기본값이 되는 구도가 반복될 수 있다. 다만 MHS는 아직 프리뷰이고 채택 기업 수도 공개되지 않았다.

## SO WHAT

**닿는 경로·시차** — 학부생에게 이 소식이 닿는 경로는 두 갈래이고 둘 다 시간이 걸린다.

하나는 제조·바이오 쪽 취업 시장이다. 국내 제조 AX 사업이 정부 예산으로 굴러가는 중이라, 생산관리·품질·설비 기획 직무에서 'AI를 붙인 공정'을 설명할 일이 늘어날 여지가 있다. 다만 이번 규격 자체가 국내 공장에 들어오려면 장비 제조사의 대응이 먼저다.

다른 하나는 규제·인증 쪽이다. 유럽 기계규정이 2027년 1월 적용을 앞두고 있어, 수출 제조사의 인증·문서 업무가 늘어나는 방향은 예측 가능하다.

국내 실행 제약은 별도로 두껍다. 산업안전보건기준에 관한 규칙은 로봇 작업영역에 울타리 또는 감응형 방호장치 설치를 원칙으로 두고, 협동로봇은 국제·한국산업표준에 부합할 때 이 면제를 받는다([인더스트리뉴스](https://www.industrynews.co.kr/news/articleView.html?idxno=51611)). 산업용 로봇은 설치일로부터 3년 이내 안전검사를 받고 KS B ISO 10218-2 기준으로 설치해야 한다([로봇 시스템 위험성평가 가이드](https://doc.safetics.io/insight-risk-assessment/)). 소프트웨어 규격이 바뀌어도 이 절차가 대체되지는 않는다.

**지금 해당 없는 것** — 이 규격을 지금 써 볼 방법은 학부생에게 없다. 선별 조직 대상 리서치 프리뷰이고, 대상 장비는 개인이 접근할 수 없는 실험·제조 기기다.

'피지컬 AI'라는 말이 붙었다고 로봇 관련 신규 채용이 늘었다는 국내 데이터도 아직 없다. 42개 사업장 수치는 정부 지원 사업 대상을 점검한 값이지, 산업 전체 평균이 아니다.

경영·MIS 전공 학부생 입장에서 이 소재는 당장 쓸 기술이 아니라, 이후 몇 년간 제조 쪽 채용 공고의 단어가 어디서 오는지를 미리 아는 용도에 가깝다.

**지금 할 수 있는 것** — 비용 0원으로 가능한 것은 세 가지다.

첫째, 쓰고 있는 AI 도구에서 연결 목록을 직접 열어 본다. 어떤 외부 시스템이 붙어 있고 무엇이 안 붙어 있는지 적어 두면, 규격이 해결하려는 문제가 무엇인지 손으로 확인된다.

둘째, 산업부 M.AX·AI 팩토리 사례 공개 자료에서 한 건을 골라 읽는다. 생산성 수치가 어느 공정의 어떤 작업에서 나왔는지 한 줄로 정리하면, 30.1%라는 숫자를 인용할 때 조건까지 같이 말할 수 있다.

셋째, 협동로봇 제조사 한 곳의 제품 사양 문서를 열어 안전 관련 항목을 찾아본다. 속도·힘 제한이 제품에서 어떻게 표기되는지 보면, 규격이 코드로 고정하려는 대상이 구체적으로 보인다.

::: 출처
Anthropic — Previewing the Model Hardware Standard | https://www.anthropic.com/news/model-hardware-standard-research-preview | 8/27 발표·재닐리아 공동 개발·오픈소스 예고
CNBC — Anthropic pushes into physical world with new standard | https://www.cnbc.com/2026/08/27/anthropic-pushes-into-physical-world-with-new-standard-to-help-ai-agents-operate-machines.html | 대상 장비 범위·드라이버 동작·켈리 발언
Fortune — Anthropic makes first move into physical AI | https://fortune.com/2026/08/27/anthropic-makes-first-move-into-physical-ai-with-universal-standard-for-scientists-manufacturing/ | 통합 소요 시간·얼리 액세스 명단
와우테일 — 앤트로픽, AI가 실험장비 직접 조작하는 표준 'MHS' 공개 | https://wowtale.net/2026/08/29/263648/ | 두산로보틱스 참여·AWS Strands Robots·허깅페이스 LeRobot
kingy.ai — What MHS Actually Changes | https://kingy.ai/blog/anthropic-model-hardware-standard-mhs/ | 커뮤니티 해설 — 3계층·자연어 장비 태그·안전 제약(비단정)
Forbes — Agent2Agent Joins The Agentic AI Foundation Alongside MCP | https://www.forbes.com/sites/janakirammsv/2026/08/19/agent2agent-joins-the-agentic-ai-foundation-alongside-mcp/ | A2A의 AAIF 합류
Linux Foundation — Formation of the Agentic AI Foundation | https://www.linuxfoundation.org/press/linux-foundation-announces-the-formation-of-the-agentic-ai-foundation | MCP 창립 프로젝트 이관
EU-OSHA — Regulation 2023/1230/EU machinery | https://osha.europa.eu/en/legislation/directive/regulation-20231230eu-machinery | 기계규정 개요
Baker McKenzie — Machinery Regulation | https://www.bakermckenzie.com/en/insight/publications/resources/product-risk-radar-articles/machinery-regulation | 2027-01-20 적용·ML 안전부품 제3자 적합성 평가
대한민국 정책브리핑 — 제조업 AI 대전환으로 생산성 30%↑ 불량률 15%↓ | https://www.korea.kr/news/policyNewsView.do?newsId=148969347 | 42개 사업장 30.1%·15.5%·1500여 기관·AI 팩토리 500개
ZDNet Korea — 제조업 AX 효과, 생산성 30%↑ 불량률 15%↓ | https://zdnet.co.kr/view/?no=20260804133115 | 같은 점검 결과 교차 확인
인더스트리뉴스 — 협동로봇 안전 인증, 울타리 없는 협업 위한 필수 조건 | https://www.industrynews.co.kr/news/articleView.html?idxno=51611 | 로봇 작업영역 방호 원칙·협동로봇 면제 요건
Safetics — 로봇 시스템 위험성평가 가이드 | https://doc.safetics.io/insight-risk-assessment/ | 안전검사 시점·KS B ISO 10218-2 설치 기준
:::
