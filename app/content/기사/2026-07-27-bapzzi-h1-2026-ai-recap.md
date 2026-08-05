---
title: 2026 상반기 AI — 신입용 여섯 축 정리
author: bapzzi
date: 2026-07-27
시각: 15:20
source_url: https://news.sap.com/2026/05/sap-sapphire-sap-unveils-autonomous-enterprise/
source_name: SAP News · OpenAI · CNBC 외
성격: 심층 분석
주제: 시장·생태계
설명: 2026년 1–6월 주요 사건을 모델·에이전트·규제·기업 도입·돈·한국 여섯 축으로 정리한 온보딩 문서.
태그: [온보딩, 모델, 에이전트, 규제, ERP]
이미지: /img/covers/sap-sapphire-2026.jpg
이미지설명: SAP Sapphire 2026 키노트 무대 프레스 사진 — 이 글 '기업 도입' 축의 대표 사건인 SAP 자율 기업 발표 현장
---

::: 요약
- 2026년 1–6월, AI는 *대답하는 도구에서 일을 끝내는 에이전트로* 무게중심을 옮겼다. 무대도 개발자 화면에서 일반 사무직 PC와 ERP 코어로 넓어졌다.
- 규제는 갈라졌다 — 한국·EU는 제도화(강도 조절), 미국은 완화·연방 단일화. 대신 미국은 수출통제로 최상위 모델을 직접 껐다 켰다.
- 돈은 상위 소수에 몰렸고(OpenAI 1,220억 달러 조달·빅테크 4사 설비투자 약 7,000억 달러), 그 투자가 SK하이닉스·삼성전자 역대 실적으로 되돌아왔다.
- 각 축 끝의 "시사점"과 마지막 "그래서 우리는"에 경영학부·MIS·ERP 관점을 정리했다.
:::

2026년 7월에 시작한 인사이트가 다루지 못한 상반기를 한 장으로 정리한다. 각 축은 시간순이고, 모든 사건에 출처를 붙였다.

::: 수치
1,220억 달러 | OpenAI 조달 — 기업가치 8,520억 달러 | CNBC 3/31
200개+ | SAP가 예고한 ERP 에이전트 | SAP News 5/12
12억 달러 | Salesforce Agentforce 연간 반복 매출 | Salesforce IR 5/27
37.6조 원 | SK하이닉스 분기 영업이익 — 창사 최대 | SK하이닉스 4월
:::

여섯 달을 사건 하나씩으로 압축하면 이렇다. 상세는 아래 각 축에서.

::: 로드맵
1/12 | Claude Cowork 공개 | 사무직용 컴퓨터 에이전트의 시작
1/22 | 한국 AI기본법 시행 | 세계 두 번째 포괄 AI 규제
2/5 | OpenAI Frontier 출시 | 에이전트를 직원처럼 관리하는 기업 플랫폼
3/31 | OpenAI 1,220억 달러 조달 | 역대 최대 — 일부는 AGI 달성 조건부
4/23 | GPT-5.5 가격 2배 인상 | "성능값 받기" 시대의 신호탄
5/12 | SAP 자율 기업 선언 | ERP에 에이전트 200개+ 예고
6/12 | 미국, 최상위 모델 수출통제 | 쓰던 AI가 정부 명령으로 중단
6/16 | SpaceX, Cursor 600억 달러 인수 | 코딩 에이전트 = 전략 자산
:::

## 모델 경쟁

성능 경쟁의 축이 "더 싸게"에서 "성능값 받기"로 꺾인 반기였다.

- **4/23** — OpenAI, GPT-5.5 출시. API 가격을 입력 기준 100만 토큰당 $2.50에서 $5.00으로 **2배** 인상 ([OpenAI](https://openai.com/index/introducing-gpt-5-5/)) — 성능이 오르면 단가도 오를 수 있다는 첫 신호. 도입 예산 계산이 달라진다.
- **4/24** — 중국 DeepSeek, V4 프리뷰 공개. 오픈웨이트¹ + 100만 토큰 컨텍스트², 화웨이 칩으로 추론 ([Wikipedia](https://en.wikipedia.org/wiki/DeepSeek_(chatbot))) — 무료 모델이 유료 최상위를 추격하면서 "굳이 비싼 걸 써야 하나"라는 선택지가 생겼다.
- **5/19** — 구글 I/O. Gemini 3.5 Flash 정식 출시, 영상 생성·개인 비서 에이전트 공개 ([TechCrunch](https://techcrunch.com/2026/05/19/google-updates-its-gemini-app-to-take-on-chatgpt-and-claude-at-io-2026/)) — 검색·안드로이드에 기본 탑재되며 "의식하지 않고 쓰는 AI" 단계로. 출발점은 2025년 11월 Gemini 3였다 ([Wikipedia](https://en.wikipedia.org/wiki/Gemini_3_(AI))).
- **5/28** — Anthropic, Claude Opus 4.8 출시. 가격 동결, 코딩 벤치마크 SWE-bench **88.6%** ([Anthropic](https://www.anthropic.com/news/claude-opus-4-8)) — 상반기 기업용 업무 자동화의 사실상 기준 모델.
- **6/9** — Anthropic, 최상위 모델 Fable 5·Mythos 5 출시. 사흘 뒤 미 정부 수출통제로 전면 중단됐다가 6월 말 해제 ([InfoQ](https://www.infoq.com/news/2026/06/claude-5-release/)) — 상세는 아래 규제 축.

> **시사점 —** 모델 가격이 오르내리는 시대엔 "어떤 모델을 쓰나"보다 *모델이 바뀌어도 무너지지 않는 활용 구조*가 자산이다. 이 스터디가 특정 모델 종속 없이 맥락 설계·검증 구조를 익히는 이유다.
>
> 기업 도입 관점에선 API 단가가 한 번에 2배가 될 수 있다는 사실 자체가 총소유비용(TCO³) 계산 항목이 됐다. "도입하면 얼마 드나"라는 질문에 단가 변동 리스크까지 넣어야 한다.

::: 용어
오픈웨이트 | 모델 내부 값(가중치)을 공개해 누구나 내려받아 쓰고 고칠 수 있게 한 배포 방식
컨텍스트 | 모델이 한 번에 읽을 수 있는 입력 분량. 토큰 = 글자·단어를 쪼갠 단위
TCO | 총소유비용(Total Cost of Ownership). 도입가만이 아니라 운영·변동 비용까지 합친 값
:::

## 에이전트

"질문에 답하는 AI"가 아니라 "일을 맡아 끝내는 AI"가 제품이 된 반기.

- **1/12** — Anthropic, Claude Cowork 공개. 개발자가 아닌 사무직용 컴퓨터 에이전트 — 폴더를 읽고 파일을 만들고 정리한다 ([ADTmag](https://adtmag.com/articles/2026/01/20/anthropic-expands-claude-computer-agent-with-cowork.aspx)).
- **2/5** — OpenAI, 기업용 에이전트 플랫폼 Frontier 출시. 에이전트에 신분·권한·성과관리를 부여해 *직원처럼 운영* ([TechCrunch](https://techcrunch.com/2026/02/05/openai-launches-a-way-for-enterprises-to-build-and-manage-ai-agents/)) — AI 도입이 IT 프로젝트가 아니라 조직 설계 문제가 됐다.
- **3/9** — MCP¹ 2026 로드맵 공개. 감사추적·SSO 등 기업 대응을 우선순위로 명시 ([MCP 블로그](https://blog.modelcontextprotocol.io/posts/2026-mcp-roadmap/)) — AI를 사내 시스템에 꽂는 "표준 콘센트"가 잡혀야 ERP 연동이 싸진다.
- **5월** — Microsoft Copilot Studio, 화면을 직접 조작하는 Computer-Using Agents 정식 출시 ([Microsoft](https://www.microsoft.com/en-us/microsoft-copilot/blog/copilot-studio/new-and-improved-computer-using-agents-a-new-workflows-experience-and-real-time-voice-experiences/)) — API가 없는 낡은 시스템도 자동화 대상이 됐다.
- **6/16** — SpaceX, 코딩 도구 Cursor 운영사를 **600억 달러** 전액 주식 인수 ([CNBC](https://www.cnbc.com/2026/06/16/spacex-spcx-cursor-acquisition-ipo.html)) — 코딩 에이전트가 수십조 원짜리 전략 자산으로 평가받았다.

> **시사점 —** 에이전트에 권한을 주고, 완료 조건을 정하고, 성과를 관리하는 일은 코드가 아니라 *조직 설계의 언어*다. OpenAI가 에이전트 플랫폼에 "신분·권한·성과관리"를 넣었다는 건 이 일이 경영학 전공자의 자리라는 뜻이기도 하다.
>
> MCP 같은 표준은 MIS 수업의 "시스템 통합"이 AI 시대에 어떻게 번역되는지 보여주는 실물이다.
>
> 화면을 직접 조작하는 에이전트는 API 없는 낡은 전산이 많은 국내 기업에서 수요가 클 수밖에 없다. SI·DX 직무 면접에서 나올 이야기다.

::: 용어
MCP | Model Context Protocol. AI와 외부 시스템(파일·DB·업무 도구)을 연결하는 공개 표준 규격
:::

## 규제·거버넌스

방향이 하나가 아니다 — 세 갈래가 동시에 진행됐다.

::: 결정
한국·EU | 제도화 | 한국은 1/22 AI기본법 시행, EU는 고위험 의무를 2027년으로 미루며 속도 조절
미국 행정부 | 완화·연방 단일화 | 3/20 국가 AI 정책 프레임워크 — 주(州)별 규제를 걷어내는 방향
미 상무부 | 국가 통제 | 6/12 최상위 모델 수출통제 발동 — 규제 완화와 별개로 전략물자 취급
:::

- **1/22** — 한국 AI기본법 시행. EU에 이어 세계 두 번째 포괄 규제 — 고영향 AI¹ 안전성 확보 의무, 생성물 워터마크 표시 의무 ([법무법인 세종](https://www.shinkim.com/kor/media/newsletter/3114)) — 채용·대출·의료 등에 AI를 쓰면 지켜야 할 법이 생겼다.
- **3/20** — 미 행정부, 국가 AI 정책 프레임워크 발표. 규제 완화·연방 단일화 방향 ([Morrison Foerster](https://www.mofo.com/resources/insights/260402-trump-administration-releases-national-ai-policy-framework)) — 2025년 12월 행정명령([Seyfarth](https://www.seyfarth.com/news-insights/president-trump-signs-executive-order-preempting-state-ai-laws-and-centralizing-federal-oversight.html))의 후속.
- **5/6** — EU, 디지털 옴니버스 잠정 합의. AI법 고위험 의무 시행을 2026년 8월에서 **2027년 12월** 이후로 연기 ([Gibson Dunn](https://www.gibsondunn.com/eu-ai-act-omnibus-agreement-postponed-high-risk-deadlines-and-other-key-changes/)) — *가장 강한 규제도 산업 압력에 밀렸다*. 제안 자체는 2025년 11월부터 ([DLA Piper](https://knowledge.dlapiper.com/dlapiperknowledge/globalemploymentlatestdevelopments/2026/The-Digital-AI-Omnibus-Proposed-deferral-of-high-risk-AI-obligations-under-the-AI-Act)).
- **6/1** — 플로리다주, OpenAI와 CEO 개인을 제소. 주 정부의 첫 AI 소송 ([CNBC](https://www.cnbc.com/2026/06/01/florida-ag-open-ai-altman-lawsuit.html)) — 책임이 회사를 넘어 경영진 개인까지 갔다.
- **6/12** — 미 상무부, 최상위 모델(Fable 5·Mythos 5)에 수출통제² 발동 — 전 세계 서비스 즉시 중단, 6월 말 조건부 해제 ([Mayer Brown](https://www.mayerbrown.com/en/insights/publications/2026/06/commerce-department-extends-export-controls-to-advanced-ai-models-authorizes-release-to-specific-trusted-partners)) — 쓰던 AI가 정부 명령으로 하루아침에 끊길 수 있다. 특정 모델 하나에 업무를 묶어두면 안 되는 이유.

> **시사점 —** 고영향 AI 목록(채용·대출·의료)은 곧 경영 직무 목록이다. 인사·재무·마케팅에서 AI를 쓰는 순간 준법 점검이 따라온다. "AI 거버넌스를 아는 경영학도"는 아직 드물다 — 차별화 지점이다.
>
> 수출통제 사례는 공급망 리스크 관리의 실물 교재이기도 하다. 특정 외산 모델 하나에 업무 프로세스를 묶으면 어떤 일이 생기는지, 상반기에 실제로 벌어졌다.

::: 용어
고영향 AI | 채용·대출·의료처럼 사람의 권리·안전에 큰 영향을 주는 영역에 쓰이는 AI. 법이 별도 의무를 부과
수출통제 | 무기·첨단기술을 외국에 넘길 때 정부 허가를 요구하는 제도. 최상위 AI 모델이 처음 이 대상이 됐다
:::

## 기업 도입·ERP×AI

파일럿이 끝나고 숫자가 나오기 시작했다. ERP 진영의 방향 선언이 몰린 반기.

- **2/5** — OpenAI, Frontier 출시와 함께 ServiceNow·Snowflake와 대형 계약 ([CNBC](https://www.cnbc.com/2026/02/05/open-ai-frontier-enterprise-customers.html)) — AI 회사 매출축이 개인 구독에서 기업 계약으로.
- **5/12** — SAP Sapphire, "자율 기업(Autonomous Enterprise)" 선언. 5개 영역 **200개 이상** 에이전트 예고 ([SAP News](https://news.sap.com/2026/05/sap-sapphire-sap-unveils-autonomous-enterprise/)) — *ERP가 사람이 입력하는 시스템에서 스스로 프로세스를 돌리는 시스템으로*.
- **5/12** — SAP, Claude를 AI 포트폴리오 주력 추론 모델로 채택. Joule 에이전트가 MCP로 S/4HANA·SuccessFactors를 넘나든다 ([ERP Today](https://erp.today/sap-anthropic-claude-joule-mcp/)) — ERP 벤더가 자체 모델 대신 외부 모델을 코어에 넣었다.
- **5월** — SAP, Joule Studio 발표. 기업이 직접 에이전트를 만들고 관리, 파트너 지원에 **1억 유로** 배정 ([SAP News](https://news.sap.com/2026/05/new-joule-studio-enterprise-scale-agentic-development/)) — 에이전트 제작이 SI¹·컨설팅의 새 일감이 됐다.
- **5/27** — Salesforce, Agentforce 연간 반복 매출 **12억 달러** (전년 대비 +205%) 공시 ([Salesforce IR](https://investor.salesforce.com/news/news-details/2026/Salesforce-Delivers-Record-First-Quarter-Fiscal-2027-Results/default.aspx)) — 에이전트가 실제로 돈이 된다는 첫 공식 숫자.
- **6월** — AI 연계 감원 누적 약 5만 건. 스탠퍼드 연구 기준 AI 노출 직무의 22–25세 고용 약 **6%** 감소, 고연령층은 오히려 증가 ([CBS News](https://www.cbsnews.com/news/ai-layoffs-hiring-entry-level-workers/)) — 타격은 해고보다 신입 채용 축소로 나타난다.

> **시사점 —** 이 축이 우리 스터디의 본진이다. ERP가 "사람이 입력하는 시스템"에서 "스스로 도는 시스템"으로 가면, 사람의 일은 입력·운영이 아니라 *프로세스 설계와 에이전트 감독*으로 옮겨간다. SAP 수업에서 배운 트랜잭션 처리 위에 "이 프로세스를 에이전트에게 어디까지 맡길까"라는 질문이 얹히는 것이다.
>
> DX·ERP 지망이라면 Joule과 Agentforce가 만들 직무 변화를 지금부터 추적할 것.
>
> 신입 채용 6% 감소는 뒤집으면 "AI로 일을 끝내본 증거를 가진 신입"이 그만큼 귀해졌다는 뜻이다. 배포물과 기록이 이력서가 된다.

::: 용어
SI | 시스템 통합(System Integration). 기업 전산 시스템을 대신 구축·운영해 주는 사업
:::

## 돈의 흐름

역대급 조달·투자·실적이 한 반기에 몰렸다. 규모 차이가 곧 구조다 — 개별 회사 조달이 아무리 커도 빅테크 인프라 투자 앞에선 한 칸이다.

![2026 상반기 공개된 AI 조달·투자·인수 금액 비교 막대 그래프](/img/기사/h1-2026-funding.svg)

- **2/2** — SpaceX가 xAI 인수 — 합병 기업가치 **1.25조 달러**, 사상 최대 비상장 합병 ([CNBC](https://www.cnbc.com/2026/02/03/musk-xai-spacex-biggest-merger-ever.html))
- **2/6** — 빅테크 4사(구글·MS·메타·아마존) 2026년 설비투자 합계 약 **7,000억 달러** 규모로 확대 ([CNBC](https://www.cnbc.com/2026/02/06/google-microsoft-meta-amazon-ai-cash.html)) — 회수 실패 시 시장 조정으로 직결되는 규모.
- **2/12** — Anthropic, 시리즈 G **300억 달러** 조달 — 기업가치 3,800억 달러 ([TechCrunch](https://techcrunch.com/2026/02/12/anthropic-raises-another-30-billion-in-series-g-with-a-new-value-of-380-billion/))
- **3/31** — OpenAI, **1,220억 달러** 조달 — 기업가치 8,520억 달러, 일부 투자금은 IPO 또는 AGI 달성 조건부 ([CNBC](https://www.cnbc.com/2026/03/31/openai-funding-round-ipo.html))
- **5/20** — 엔비디아 분기 실적 — 매출 **820억 달러** (+85%), 데이터센터 752억 달러 ([Motley Fool](https://www.fool.com/earnings/call-transcripts/2026/05/20/nvidia-nvda-q1-2027-earnings-transcript/)) — AI 경기의 계기판.
- **6/11** — SpaceX 사상 최대 IPO — 약 **750억 달러** 조달, 첫날 시총 약 2.1조 달러 ([NPR](https://www.npr.org/2026/06/11/nx-s1-5853199/spacex-ipo-price-elon-musk)) — 뒤이을 AI 기업 상장의 가격 기준점.

> **시사점 —** 이 투자 규모는 흐름이 당분간 멈추지 않는다는 신호다. 다만 회수가 어긋나면 조정도 그만큼 크다.
>
> 진로를 "AI 붐" 하나에 걸기보다, 붐이 식어도 남는 것 — 프로세스를 읽고 시스템으로 푸는 힘 — 에 투자하는 편이 안전하다. 그게 MIS라는 전공의 원래 자리이기도 하다.

## 한국

규제(1/22 AI기본법 — 위 규제 축)와 함께, 소버린 AI¹ 선발전과 반도체 실적이 상반기를 채웠다.

::: 수치
37.6조 원 | SK하이닉스 1분기 영업이익 — 이익률 72% | SK하이닉스 뉴스룸
57.2조 원 | 삼성전자 1분기 영업이익 — 전분기 대비 +185% | 삼성전자 뉴스룸
99개 | AI 기본계획(2026–2028) 실행과제 | 국가AI전략위 2/25
:::

- **1/15** — 정부 독자 AI 파운데이션 모델 1차 평가 — LG·SKT·업스테이지 진출, 네이버클라우드 탈락 ([AI타임스](https://www.aitimes.kr/news/articleView.html?idxno=38163)) — 국가가 AI 국가대표를 예산·심사로 선발하는 중.
- **2/25** — 국가AI전략위, AI 기본계획(2026–2028) 확정 — **99개** 실행과제 ([AI타임스](https://www.aitimes.kr/news/articleView.html?idxno=38806)) — 향후 3년 국내 AI 예산이 이 문서를 따라 움직인다.
- **4월** — SK하이닉스 1분기 영업이익 **37.6조 원** (영업이익률 72%, 창사 최대) ([SK하이닉스](https://news.skhynix.co.kr/q1-2026-business-results/)) — 미국 AI 투자가 HBM²을 타고 한국 실적으로.
- **4월** — 삼성전자 1분기 영업이익 **57.2조 원** (전분기 대비 +185%) ([삼성전자 뉴스룸](https://news.samsung.com/kr/삼성전자-2026년-1분기-실적-발표)) — AI 사이클과 한국 경제가 한 몸이 됐다.

> **시사점 —** 반도체 실적과 정부 예산은 국내 취업 지형도다. AI 인프라·소버린 AI 관련 채용과 인턴·공모전이 실행과제 99개의 예산 흐름을 따라 생긴다.
>
> 기회가 어디서 열릴지 보려면 뉴스보다 이 계획 문서를 먼저 보는 편이 빠르다.

::: 용어
소버린 AI | 외국 기술에 의존하지 않는 자국 소유·통제 AI. 정부가 직접 육성하는 흐름
HBM | 고대역폭 메모리(High Bandwidth Memory). AI 칩에 붙는 고성능 메모리 — SK하이닉스·삼성의 주력
:::

## 그래서 우리는

상반기 흐름을 광운대 경영학부·MIS·ERP라는 우리 분모의 언어로 바꾸면 네 가지다.

::: 결정
에이전트가 조직 문제가 됐다 | 위임 구조를 익힌다 | 권한·완료 조건·검증 설계는 개발이 아니라 경영의 언어 — 스터디의 핵심 근육
ERP가 자율 기업으로 간다 | SAP×AI 접점을 추적한다 | Joule·Agentforce가 DX·ERP 직무의 실무 어휘가 된다
신입 채용이 줄었다 | 활용 증거를 쌓는다 | 배포물·기록이 "AI로 일을 끝내는 사람"의 증명 — 이 허브가 그 저장소
규제가 실무가 됐다 | 거버넌스 문해력을 챙긴다 | 고영향 AI 점검은 경영 직무의 새 기본기, 아는 사람이 아직 드물다
:::

인사이트는 앞으로도 사건 정리에서 멈추지 않는다. 같은 사건이라도 우리 분모에서 무엇을 보고 무엇을 준비할지까지 적는다.

::: 출처
GPT-5.5 출시 — OpenAI (4/23) | https://openai.com/index/introducing-gpt-5-5/
DeepSeek V4 — Wikipedia | https://en.wikipedia.org/wiki/DeepSeek_(chatbot)
구글 I/O 2026 — TechCrunch (5/19) | https://techcrunch.com/2026/05/19/google-updates-its-gemini-app-to-take-on-chatgpt-and-claude-at-io-2026/
Gemini 3 (배경, 2025-11) — Wikipedia | https://en.wikipedia.org/wiki/Gemini_3_(AI)
Claude Opus 4.8 — Anthropic (5/28) | https://www.anthropic.com/news/claude-opus-4-8
Claude Fable 5·Mythos 5 — InfoQ (6월) | https://www.infoq.com/news/2026/06/claude-5-release/
Claude Cowork — ADTmag (1월) | https://adtmag.com/articles/2026/01/20/anthropic-expands-claude-computer-agent-with-cowork.aspx
OpenAI Frontier — TechCrunch (2/5) | https://techcrunch.com/2026/02/05/openai-launches-a-way-for-enterprises-to-build-and-manage-ai-agents/
MCP 2026 로드맵 — MCP 블로그 (3/9) | https://blog.modelcontextprotocol.io/posts/2026-mcp-roadmap/
Copilot Studio CUA — Microsoft (5월) | https://www.microsoft.com/en-us/microsoft-copilot/blog/copilot-studio/new-and-improved-computer-using-agents-a-new-workflows-experience-and-real-time-voice-experiences/
SpaceX×Cursor — CNBC (6/16) | https://www.cnbc.com/2026/06/16/spacex-spcx-cursor-acquisition-ipo.html
AI기본법 시행 — 법무법인 세종 (1/22) | https://www.shinkim.com/kor/media/newsletter/3114
미 AI 정책 프레임워크 — Morrison Foerster (3월) | https://www.mofo.com/resources/insights/260402-trump-administration-releases-national-ai-policy-framework
2025-12 행정명령 (배경) — Seyfarth | https://www.seyfarth.com/news-insights/president-trump-signs-executive-order-preempting-state-ai-laws-and-centralizing-federal-oversight.html
EU 디지털 옴니버스 — Gibson Dunn (5/6) | https://www.gibsondunn.com/eu-ai-act-omnibus-agreement-postponed-high-risk-deadlines-and-other-key-changes/
옴니버스 제안 (배경, 2025-11) — DLA Piper | https://knowledge.dlapiper.com/dlapiperknowledge/globalemploymentlatestdevelopments/2026/The-Digital-AI-Omnibus-Proposed-deferral-of-high-risk-AI-obligations-under-the-AI-Act
플로리다 소송 — CNBC (6/1) | https://www.cnbc.com/2026/06/01/florida-ag-open-ai-altman-lawsuit.html
수출통제 — Mayer Brown (6월) | https://www.mayerbrown.com/en/insights/publications/2026/06/commerce-department-extends-export-controls-to-advanced-ai-models-authorizes-release-to-specific-trusted-partners
Frontier 기업 계약 — CNBC (2/5) | https://www.cnbc.com/2026/02/05/open-ai-frontier-enterprise-customers.html
SAP 자율 기업 — SAP News (5/12) | https://news.sap.com/2026/05/sap-sapphire-sap-unveils-autonomous-enterprise/
SAP×Claude — ERP Today (5월) | https://erp.today/sap-anthropic-claude-joule-mcp/
Joule Studio — SAP News (5월) | https://news.sap.com/2026/05/new-joule-studio-enterprise-scale-agentic-development/
Salesforce 실적 — Salesforce IR (5/27) | https://investor.salesforce.com/news/news-details/2026/Salesforce-Delivers-Record-First-Quarter-Fiscal-2027-Results/default.aspx
AI 감원·신입 채용 — CBS News (6월) | https://www.cbsnews.com/news/ai-layoffs-hiring-entry-level-workers/
SpaceX×xAI — CNBC (2/2) | https://www.cnbc.com/2026/02/03/musk-xai-spacex-biggest-merger-ever.html
빅테크 capex — CNBC (2/6) | https://www.cnbc.com/2026/02/06/google-microsoft-meta-amazon-ai-cash.html
Anthropic 시리즈 G — TechCrunch (2/12) | https://techcrunch.com/2026/02/12/anthropic-raises-another-30-billion-in-series-g-with-a-new-value-of-380-billion/
OpenAI 조달 — CNBC (3/31) | https://www.cnbc.com/2026/03/31/openai-funding-round-ipo.html
엔비디아 실적 — Motley Fool (5/20) | https://www.fool.com/earnings/call-transcripts/2026/05/20/nvidia-nvda-q1-2027-earnings-transcript/
SpaceX IPO — NPR (6/11) | https://www.npr.org/2026/06/11/nx-s1-5853199/spacex-ipo-price-elon-musk
독자 AI 모델 1차 평가 — AI타임스 (1/15) | https://www.aitimes.kr/news/articleView.html?idxno=38163
AI 기본계획 — AI타임스 (2/25) | https://www.aitimes.kr/news/articleView.html?idxno=38806
SK하이닉스 1분기 — SK하이닉스 뉴스룸 (4월) | https://news.skhynix.co.kr/q1-2026-business-results/
삼성전자 1분기 — 삼성전자 뉴스룸 (4월) | https://news.samsung.com/kr/삼성전자-2026년-1분기-실적-발표
:::
