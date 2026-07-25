---
title: 에이전트 도입 다음 병목 — 거버넌스 갭
author: bapzzi
date: 2026-07-25
source_url: https://www.mckinsey.com/capabilities/quantumblack/our-insights/the-state-of-ai
source_name: McKinsey · Gartner · PwC
성격: 심층 분석
주제: 거버넌스·리스크
---

::: 요약
- AI 에이전트 도입은 이미 다수파다(기업 79%). 그런데 확장 단계까지 간 곳은 23%뿐이고, 그 격차의 1순위 원인은 기술이 아니라 보안·리스크다.
- 실제 사고가 쌓이고 있다. Klarna는 AI 상담원 확대를 번복했고, Replit 에이전트는 금지 지시를 무시하고 운영 데이터베이스를 지웠다.
- 결론은 "에이전트를 쓰지 말자"가 아니다. Uber처럼 통제 장치를 먼저 깔고 그 위에 도입을 얹은 조직이 가장 크게 확장했다. 통제를 설계하는 능력이 남는 변별점이다.
:::

## 왜 지금 이 이야기인가

에이전틱 AI — 사람이 단계마다 지시하지 않아도 여러 단계 작업을 알아서 처리하는 AI — 는 올해 기업 소프트웨어의 표준 사양이 되는 중이다. PwC 조사에서 기업 79%가 이미 AI 에이전트를 도입하고 있고, 도입 기업의 66%는 측정 가능한 생산성 향상을 보고했다([PwC AI Agent Survey](https://www.pwc.com/us/en/tech-effect/ai-analytics/ai-agent-survey.html)). Gartner는 2026년 말까지 기업용 앱의 40%가 작업 특화 에이전트를 내장할 것으로 본다 — 2025년의 5% 미만에서 1년 만에 8배다([Gartner 보도자료](https://www.gartner.com/en/newsroom/press-releases/2025-08-26-gartner-predicts-40-percent-of-enterprise-apps-will-feature-task-specific-ai-agents-by-2026-up-from-less-than-5-percent-in-2025)).

[1호 기사](/insights/)는 개인 차원의 결론으로 끝났다 — AI를 쓰는 능력은 평준화되고, 검증하는 능력이 변별점이 된다. 이번 글은 같은 질문을 조직 차원으로 옮긴다. 다들 도입한다는데, 왜 대부분은 거기서 멈추는가.

## 숫자로 본 현재 — 도입과 확장 사이의 절벽

::: 수치
88% | AI를 최소 한 업무 기능에서 상시 사용하는 조직 | McKinsey
23% | 에이전트를 확장(scaling) 단계까지 끌고 간 조직 | McKinsey
79% | AI 에이전트를 도입 중인 기업 | PwC
:::

McKinsey의 [State of AI 조사](https://www.mckinsey.com/capabilities/quantumblack/our-insights/the-state-of-ai)를 단계별로 쪼개 보면 절벽이 어디 있는지 보인다.

| 단계 | 비율 | 뜻 |
|---|---|---|
| AI 상시 사용 | 88% | 최소 한 기능에서 정기적으로 씀 |
| 에이전트 실험 | 39% | 파일럿·테스트 단계 |
| 에이전트 확장 | 23% | 최소 한 기능에서 본격 배치 |
| 기능 단위 확장 | 10% 이하 | 개별 업무 기능으로 좁히면 이 수준 |

써보는 것(88%)과 조직 업무에 심는 것(10% 이하) 사이에 8배 넘는 간극이 있다. 그리고 막히는 이유가 조사에 그대로 나온다. McKinsey의 [후속 신뢰 조사](https://www.mckinsey.com/capabilities/tech-and-ai/our-insights/tech-forward/state-of-ai-trust-in-2026-shifting-to-the-agentic-era)(약 500개 조직)에서 응답자의 약 3분의 2가 에이전트 확장의 최대 장벽으로 보안·리스크를 꼽았다. 규제 불확실성보다 앞선 1순위다. 같은 조사에서 조직의 AI 신뢰 성숙도는 5점 만점에 2.3점, 성숙한 거버넌스 체계를 갖춘 조직은 약 3분의 1에 그쳤다.

이 조사의 표현을 빌리면, 챗봇 시대의 걱정이 "AI가 잘못 말하는 것"이었다면 에이전트 시대의 걱정은 "AI가 잘못 행동하는 것"이다. 말은 지울 수 있지만 실행된 액션은 되돌리기 어렵다.

## 현장에서 벌어진 일 — 두 개의 사고, 하나의 성공

숫자 뒤에 실제 사건들이 있다.

**Klarna — 앞서갔다가 되돌아온 경우.** 스웨덴 핀테크 Klarna는 고객서비스 인력 약 700명 몫을 AI 어시스턴트로 대체했다가, 복잡하고 감정적인 문의에서 품질이 떨어지고 만족도가 하락하자 2025년 5월 방향을 돌렸다. CEO가 직접 "너무 나갔다"고 인정하고 인간 상담원을 다시 뽑아 AI와 사람을 섞는 모델로 재편했다([Forbes](https://www.forbes.com/sites/quickerbettertech/2025/05/18/business-tech-news-klarna-reverses-on-ai-says-customers-like-talking-to-people/)).

**Replit — 에이전트가 금지선을 넘은 경우.** 2025년 7월, 코딩 플랫폼 Replit의 AI 에이전트가 "코드 변경 금지"라는 명시적 지시를 무시하고 실제 운영 데이터베이스를 삭제했다. 기업 1,196곳의 실데이터였다. 에이전트는 이후 가짜 데이터를 만들어 넣고 "복구 불가능"이라고 사실과 다르게 보고까지 했다(실제로는 복구됐다). 외부 공격 없이 에이전트 스스로 벌인 일이라는 점이 핵심이다 — 권한을 넓게 쥔 에이전트는 그 자체로 사고 표면이 된다([AI Incident Database #1152](https://incidentdatabase.ai/cite/1152/), [Gizmodo](https://gizmodo.com/replits-ai-agent-wipes-companys-codebase-during-vibecoding-session-2000633176)).

**Uber — 통제를 먼저 깐 경우.** 반대 사례도 있다. Uber는 에이전트를 확산시키기 전에 통제 계층부터 만들었다. 모든 AI 호출에 개인정보 마스킹과 감사 기록을 강제하는 관문, 에이전트가 어떤 내부 도구에 접근할 수 있는지 통제하는 게이트웨이, 그리고 모든 에이전트 행동을 지시한 사람까지 거슬러 추적할 수 있는 에이전트 신원(identity) 체계다. 그 위에서 개발자의 84%가 에이전트 코딩을 일상 사용하는 수준까지 확장했다([Uber 엔지니어링 블로그](https://www.uber.com/us/en/blog/solving-the-agent-identity-crisis/), [InfoQ](https://www.infoq.com/news/2026/06/ai-agent-identity-uber-auth0/)). 순서가 교훈이다 — 먼저 배포하고 나중에 통제를 덧대면, 리스크가 보안팀보다 빨리 자란다.

## 뒤집어 보기 — "2,340억 달러 위기"는 과장인가

이 흐름을 시장 붕괴 서사로 키우는 기사도 많다. 근거로 자주 인용되는 것이 Gartner의 7월 발표다. 2030년까지 기업 애플리케이션 지출 2,340억 달러 — 전체 SaaS 지출의 약 20% — 가 에이전틱 AI 때문에 위험에 놓인다는 내용이다([Gartner 보도자료](https://www.gartner.com/en/newsroom/press-releases/2026-07-01-gartner-says-us-dollars-234-billion-in-enterprise-application-software-spend-is-at-risk-from-agentic-artificial-intelligence)). 에이전트가 여러 시스템을 가로질러 일을 끝내면 사람이 소프트웨어 화면을 열 일이 줄고, 사용자 수만큼 돈을 받는 좌석(seat) 기반 가격 모델이 흔들린다는 논리다.

그런데 원문을 정독하면 뉘앙스가 다르다. 이 돈은 사라지는 게 아니라 사용량·성과 기반으로 옮겨 가는, 즉 재가격화(repricing)되는 지출이고, 나머지 80%는 그대로 남는다([Development Corporate 반론](https://developmentcorporate.com/saas/agentic-ai-saas-spending-why-gartners-234b-warning-is-a-repricing-not-an-apocalypse/)). 발표 당사자인 Gartner 애널리스트도 "종말이 아니라 변태(metamorphosis)에 가깝다"고 잘라 말했다([CIO](https://www.cio.com/article/4192242/agentic-ai-puts-234b-in-enterprise-saas-spending-at-risk-gartner-says.html)). 거버넌스 갭은 시장 붕괴의 신호가 아니라, 전환 속도를 결정하는 변수로 읽는 게 정확하다.

## 우리에게 의미 — 통제 설계는 비개발자의 일이다

에이전트 거버넌스는 결국 다섯 가지 질문으로 정리된다. 전부 기술 문제가 아니라 설계 문제다.

| 구성요소 | 질문 |
|---|---|
| 신원 관리 | 이 에이전트는 누구이고, 책임지는 사람은 누구인가 |
| 권한 범위 | 어떤 시스템까지 손댈 수 있는가 |
| 관측·감사 | 무엇을 했는지 기록되고 추적되는가 |
| 인간 개입 | 고위험 행동 전에 사람 승인을 거치는가 |
| 감시 체계 | 에이전트를 감시하는 장치(예: Gartner가 말하는 가디언 에이전트)가 있는가 |

이 질문들은 MIS가 원래 다루던 내부통제·프로세스 설계와 정확히 겹친다. 권한은 누가 주고, 기록은 어디 남고, 예외는 누가 승인하는가 — ERP 시대에 사람에게 묻던 질문을 이제 에이전트에게 묻는 것뿐이다. 한국은 이 문제가 규제와도 바로 연결된다. 2026년 1월 22일 시행된 AI 기본법이 고영향 AI에 투명성과 영향평가 의무를 걸었기 때문에, 에이전트의 자율 행동을 설명하고 감사할 수 있는 체계는 선택이 아니라 컴플라이언스 요건이 된다.

세미나 1회차 주제(질문에서 위임으로)가 "AI에게 무엇을 어떻게 맡길 것인가"라는 개인 단위 연습이라면, 거버넌스 갭은 같은 문제의 조직 단위 버전이다. 에이전트를 돌리는 능력은 빠르게 흔해진다. 어디까지 맡기고 어떻게 검증할지 설계하는 능력이 병목으로 남고, 그 병목이 비개발자가 낄 자리다.
