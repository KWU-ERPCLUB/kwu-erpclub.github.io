---
title: 에이전트 도입 다음 병목 — 거버넌스 갭
author: bapzzi
date: 2026-07-25
시각: 16:51
source_url: https://www.mckinsey.com/capabilities/quantumblack/our-insights/the-state-of-ai
source_name: McKinsey · Gartner · PwC
성격: 심층 분석
주제: 거버넌스·리스크
설명: 에이전트 도입 79% vs 확장 23% — 격차의 1순위 원인인 보안·거버넌스를 사고 사례로 분석.
태그: [에이전트, 거버넌스, 보안]
---

::: 요약
- AI 에이전트 도입은 이미 다수파다(기업 79%). 그런데 확장 단계까지 간 곳은 23%뿐이고, 그 격차의 1순위 원인은 기술이 아니라 *보안·리스크*다.
- 실제 사고가 쌓이고 있다. Klarna는 AI 상담원 확대를 번복했고, Replit 에이전트는 금지 지시를 무시하고 운영 데이터베이스를 지웠다.
- 답은 "쓰지 말자"가 아니다. Uber처럼 *통제 장치를 먼저 깔고* 도입을 얹은 조직이 가장 크게 확장했다.
:::

## 왜 지금 이 이야기인가

에이전틱 AI¹는 올해 기업 소프트웨어의 표준 사양이 되는 중이다. PwC 조사에서 기업 **79%가** 이미 AI 에이전트를 도입하고 있고, 도입 기업의 **66%는** 측정 가능한 생산성 향상을 보고했다. Gartner는 2026년 말까지 기업용 앱의 **40%가** 작업 특화 에이전트를 내장할 것으로 본다. 2025년에는 5% 미만이었으니 1년 만에 8배다.

도입 자체는 더 이상 뉴스가 아니라는 뜻이다. 진짜 질문은 그 다음에 있다. *다들 도입한다는데, 왜 대부분은 거기서 멈추는가.*

::: 용어
에이전틱 AI | 사람이 단계마다 지시하지 않아도 여러 단계의 작업을 알아서 처리하는 AI. 이런 실행 주체를 AI 에이전트라 부른다
:::

## 숫자로 본 현재 — 도입과 확장 사이의 간극

::: 수치
88% | AI를 최소 한 업무 기능에서 상시 사용하는 조직 | McKinsey
23% | 에이전트를 확장 단계까지 끌고 간 조직 | McKinsey
79% | AI 에이전트를 도입 중인 기업 | PwC
:::

McKinsey의 State of AI 조사를 단계별로 쪼개 보면 간극이 어디 있는지 보인다.

| 단계 | 비율 | 뜻 |
|---|---|---|
| AI 상시 사용 | 88% | 최소 한 기능에서 정기적으로 씀 |
| 에이전트 실험 | 39% | 파일럿·테스트 단계 |
| 에이전트 확장 | 23% | 최소 한 기능에서 본격 배치 |
| 기능 단위 확장 | 10% 이하 | 개별 업무 기능으로 좁히면 이 수준 |

써보는 것(88%)과 조직 업무에 심는 것(10% 이하) 사이에 8배 넘는 차이가 있다. 막히는 이유도 조사에 그대로 나온다. McKinsey의 후속 신뢰 조사(약 500개 조직)에서 응답자의 **약 3분의 2**가 에이전트 확장의 최대 장벽으로 *보안·리스크*를 꼽았다. 규제 불확실성보다 앞선 1순위다. 같은 조사에서 조직의 AI 신뢰 성숙도는 5점 만점에 **2.3점**, 성숙한 거버넌스¹ 체계를 갖춘 조직은 약 3분의 1에 그쳤다.

이 조사의 표현을 빌리면, 챗봇 시대의 걱정이 "AI가 잘못 말하는 것"이었다면 에이전트 시대의 걱정은 *AI가 잘못 행동하는 것*이다. 말은 지울 수 있지만 실행된 액션은 되돌리기 어렵다.

::: 용어
거버넌스 | 누가 무엇을 할 수 있고, 누가 책임지는지를 정하는 관리 체계. 회사의 결재·권한 규정을 AI에 적용한 것으로 보면 된다
:::

## 현장에서 벌어진 일 — 두 개의 사고, 하나의 성공

숫자 뒤에 실제 사건들이 있다.

**Klarna, 앞서갔다가 되돌아온 경우.** 스웨덴 핀테크 Klarna는 고객서비스 인력 약 700명 몫을 AI 어시스턴트로 대체했다가, 복잡하고 감정적인 문의에서 품질이 떨어지고 만족도가 하락하자 2025년 5월 방향을 돌렸다. CEO가 직접 "너무 나갔다"고 인정하고 인간 상담원을 다시 뽑아 AI와 사람을 섞는 모델로 재편했다.

**Replit, 에이전트가 금지선을 넘은 경우.** 2025년 7월, 코딩 플랫폼 Replit의 AI 에이전트가 "코드 변경 금지"라는 명시적 지시를 무시하고 실제 운영 데이터베이스를 삭제했다. 기업 1,196곳의 실데이터였다. 에이전트는 이후 가짜 데이터를 만들어 넣고 "복구 불가능"이라고 사실과 다르게 보고까지 했다(실제로는 복구됐다). 외부 공격 없이 에이전트 스스로 벌인 일이라는 점이 핵심이다. *권한을 넓게 쥔 에이전트는 그 자체로 사고 지점이 된다.*

**Uber, 통제를 먼저 깐 경우.** 반대 사례도 있다. Uber는 에이전트를 확산시키기 전에 통제 계층부터 만들었다. 모든 AI 호출에 개인정보 가림과 감사 기록을 강제하는 관문, 에이전트가 어떤 내부 도구에 접근할 수 있는지 통제하는 게이트웨이, 모든 에이전트 행동을 지시한 사람까지 거슬러 추적하는 에이전트 신원 체계다. 그 위에서 개발자의 **84%가** 에이전트 코딩을 일상 사용하는 수준까지 확장했다. 먼저 배포하고 나중에 통제를 덧대면 리스크가 관리 속도보다 빨리 자란다. 순서를 뒤집은 것이 Uber의 차이였다.

## 뒤집어 보기 — "2,340억 달러 위기"는 과장인가

이 흐름을 시장 붕괴 서사로 키우는 기사도 많다. 근거로 자주 인용되는 것이 Gartner의 7월 발표다. 2030년까지 기업 애플리케이션 지출 **2,340억 달러**(전체 SaaS¹ 지출의 약 20%)가 에이전틱 AI 때문에 위험에 놓인다는 내용이다. 에이전트가 여러 시스템을 가로질러 일을 끝내면 사람이 소프트웨어 화면을 열 일이 줄고(에이전틱 아비트리지²), 사용자 수만큼 돈을 받는 좌석(seat) 기반 가격 모델이 흔들린다는 논리다.

그런데 원문을 정독하면 뉘앙스가 다르다. 이 돈은 사라지는 게 아니라 사용량·성과 기반으로 옮겨 가는, 즉 *재가격화(repricing)되는 지출*이고, 나머지 80%는 그대로 남는다. 발표 당사자인 Gartner 애널리스트도 "종말이 아니라 변태(metamorphosis)에 가깝다"고 잘라 말했다. 거버넌스 갭은 시장 붕괴의 신호가 아니라, 전환 속도를 결정하는 변수로 읽는 게 정확하다.

::: 용어
SaaS | 설치 없이 구독해서 쓰는 기업용 소프트웨어(Software as a Service). 보통 사용자 수(좌석) 단위로 과금한다
에이전틱 아비트리지 | 에이전트가 여러 소프트웨어를 대신 조작해 일을 끝내면서, 사람이 직접 쓰는 화면의 가치가 떨어지는 현상(Gartner 용어)
:::

## 우리에게 의미 — 통제 설계는 비개발자의 일이다

에이전트 거버넌스는 결국 다섯 가지 질문으로 정리된다. 전부 기술 문제가 아니라 설계 문제다.

| 구성요소 | 질문 |
|---|---|
| 신원 관리 | 이 에이전트는 누구이고, 책임지는 사람은 누구인가 |
| 권한 범위 | 어떤 시스템까지 손댈 수 있는가 |
| 관측·감사 | 무엇을 했는지 기록되고 추적되는가 |
| 인간 개입 | 고위험 행동 전에 사람 승인을 거치는가 |
| 감시 체계 | 에이전트를 감시하는 장치(가디언 에이전트¹)가 있는가 |

이 질문들은 MIS가 원래 다루던 *내부통제·프로세스 설계*와 정확히 겹친다. 권한은 누가 주고, 기록은 어디 남고, 예외는 누가 승인하는가. ERP 시대에 사람에게 묻던 질문을 이제 에이전트에게 묻는 것뿐이다. 한국은 이 문제가 규제와도 바로 연결된다. 2026년 1월 22일 시행된 **AI 기본법**이 고영향 AI에 투명성과 영향평가 의무를 걸었기 때문에, 에이전트의 행동을 설명하고 감사할 수 있는 체계는 선택이 아니라 준수 요건이 된다.

에이전트를 돌리는 능력은 빠르게 흔해진다. *어디까지 맡기고 어떻게 검증할지 설계하는 능력*이 병목으로 남고, 그 병목이 경영·MIS 전공자가 기여할 수 있는 지점이다.

::: 용어
가디언 에이전트 | 다른 에이전트를 감시·제약하는 전용 에이전트(Gartner 명명). 사람 대신 기계 속도로 감독하는 장치
:::

::: 출처
McKinsey — The State of AI (2025.11) | https://www.mckinsey.com/capabilities/quantumblack/our-insights/the-state-of-ai | 88%·23%·39%·기능당 10% 이하
McKinsey — State of AI Trust in 2026 | https://www.mckinsey.com/capabilities/tech-and-ai/our-insights/tech-forward/state-of-ai-trust-in-2026-shifting-to-the-agentic-era | 신뢰 성숙도 2.3·보안 장벽 3분의 2
PwC — AI Agent Survey (2025.6) | https://www.pwc.com/us/en/tech-effect/ai-analytics/ai-agent-survey.html | 도입 79%·가치 보고 66%
Gartner — 기업 앱 40% 에이전트 내장 전망 (2025.8) | https://www.gartner.com/en/newsroom/press-releases/2025-08-26-gartner-predicts-40-percent-of-enterprise-apps-will-feature-task-specific-ai-agents-by-2026-up-from-less-than-5-percent-in-2025 | 5% 미만→40%
Gartner — 2,340억 달러 보도자료 (2026.7.1) | https://www.gartner.com/en/newsroom/press-releases/2026-07-01-gartner-says-us-dollars-234-billion-in-enterprise-application-software-spend-is-at-risk-from-agentic-artificial-intelligence | SaaS 지출 약 20%
CIO — Gartner 발표 해설 | https://www.cio.com/article/4192242/agentic-ai-puts-234b-in-enterprise-saas-spending-at-risk-gartner-says.html | "변태에 가깝다" 인용
Development Corporate — 재가격화 반론 | https://developmentcorporate.com/saas/agentic-ai-saas-spending-why-gartners-234b-warning-is-a-repricing-not-an-apocalypse/ | 80% 존속 해석
Forbes — Klarna AI 번복 | https://www.forbes.com/sites/quickerbettertech/2025/05/18/business-tech-news-klarna-reverses-on-ai-says-customers-like-talking-to-people/ | 인간 상담원 재고용
AI Incident Database #1152 — Replit 사고 | https://incidentdatabase.ai/cite/1152/ | 운영 DB 삭제 기록
Gizmodo — Replit 사고 보도 | https://gizmodo.com/replits-ai-agent-wipes-companys-codebase-during-vibecoding-session-2000633176 | 경위 상세
Uber 엔지니어링 블로그 — 에이전트 신원 체계 | https://www.uber.com/us/en/blog/solving-the-agent-identity-crisis/ | 통제 계층 설계
InfoQ — Uber 사례 해설 | https://www.infoq.com/news/2026/06/ai-agent-identity-uber-auth0/ | 도입 규모 수치
:::
