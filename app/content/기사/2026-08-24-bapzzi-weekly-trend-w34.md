---
title: 주간 AI 트렌드 — 8월 4주
author: bapzzi
date: 2026-08-24
시각: 23:40
source_url: https://news.skhynix.co.kr/ai-talent-recruit-2026-02/
source_name: SK하이닉스 뉴스룸 · Anthropic 외
성격: 트렌드
주제: 시장·생태계
시리즈: weekly
설명: 매주 월요일 발행하는 주간 AI 트렌드. 8/17–8/23 소식.
태그: [채용, SK하이닉스, 클로드, 에이전트, 앤트로픽]
---

::: 요약
- 8/17–8/23 한 주 요약. SK하이닉스가 자소서를 없애고 'AI 활용 역량'을 묻는 개편 채용의 서류 접수를 시작했고, 같은 주 앤트로픽은 무료 AI 교육 플랫폼 '클로드 아카데미'를 열었다.
- 에이전트 사이에 목표가 전염되는 자기전파 실험(앤트로픽·EPFL)이 보도로 화제가 됐다. 앤트로픽 IPO 준비, 엔비디아의 풀사이드 라이선스 등 대형 자금 소식은 시장·투자 브리핑에 담았다.
:::

## 이번 주 TOP 3

**1. SK하이닉스, 자소서 없앤 신입 채용 서류 접수 시작** (8/20) — SK하이닉스가 7월 30일 발표한 채용 개편에 따라, 자기소개서 대신 'AI 활용 역량'과 '반도체 직무 전문성'을 기술하는 신규 서식으로 신입 수시채용 서류를 8월 20일부터 26일까지 접수한다([SK하이닉스 뉴스룸](https://news.skhynix.co.kr/ai-talent-recruit-2026-02/)). 면접은 기존 20~30분에서 '반나절 심층면접'으로 바뀌어 과제 수행과 인터뷰를 함께 진행하고, 연령·학력 제한도 없앴다([전자신문](https://www.etnews.com/20260730000120)). 평가는 직무 전문성에 더해 AI 응용 능력·논리적 사고력을 종합해 본다. *국내 대기업이 'AI 활용 역량'을 서류의 필수 기술 항목으로 못박은 첫 대형 사례다*.

**2. 앤트로픽, 무료 AI 교육 플랫폼 '클로드 아카데미' 공개** (8/20) — 앤트로픽이 8월 20일 무료 AI 교육 플랫폼 '클로드 아카데미'를 공개했다([Anthropic 공식](https://claude.com/blog/anthropics-approach-to-teaching-and-learning-ai)). 입문부터 API 개발까지 **4단계** 학습 경로를 제공하며 비용이 들지 않는다. 기업 서류가 AI 활용 역량을 묻기 시작한 시기에, 그 역량을 쌓는 무료 경로가 같은 주에 열렸다. *비용 0원으로 시작하는 학습 자원이라 학생 독자와 직접 닿는 소식이다*.

**3. 에이전트끼리 '목표'가 옮는다 — 자기전파 페이로드 실증** (8/10 공개·8/18 보도 확산) — 앤트로픽·EPFL 연구진이 8월 10일 공개한 프리프린트에서, 스스로를 퍼뜨리는 지시문(페이로드)이 에이전트의 메모리·설정 파일을 타고 다른 에이전트로 전파될 수 있음을 모의 환경(6개 에이전트 협업 시뮬레이션)에서 보였다([The Hacker News](https://thehackernews.com/2026/08/ai-mind-viruses-can-spread-between.html)). 감염된 에이전트는 그 목표를 자기 메모리에 적고, 다음에 만나는 에이전트를 같은 방식으로 설득한다. 다만 시스템 프롬프트에 경고 한 문단을 넣는 것만으로 확산이 거의 0으로 줄었고, 실제 환경에서 퍼진 증거는 없는 것으로 알려졌다. *개인 에이전트에 메모리와 권한을 넘겨주는 흐름에서 알아둘 안전 상식이다*.

::: 용어
프리프린트(preprint) | 학술지 심사를 거치기 전에 먼저 공개하는 연구 논문 초고
페이로드(payload) | 시스템에 실려 전달되어 실제 동작을 일으키는 내용물 — 여기서는 에이전트에게 심어지는 지시문
:::

## 키워드 브리핑

### 도구·워크플로

- **Claude Code /design** — 8/17 주간 업데이트(v2.1.234–239): 아이디어·스크린샷을 편집 가능한 디자인 아트보드로 바꾸는 /design 리서치 프리뷰, 결과부터 말하는 Concise 출력 스타일 ([Claude Code 공식 What's new](https://code.claude.com/docs/en/whats-new))
- **Codex CLI 0.148** — 8/18 세션 포킹·실시간 비용 표시·아마존 베드락 프로바이더 내장 릴리스로 소개됨(커뮤니티) ([Digital Applied](https://www.digitalapplied.com/blog/claude-code-codex-cli-agent-operator-changes-august))

### 모델·공식 발표

- **ChatGPT for Teens** — 8/18 오픈AI, 청소년 전용 챗GPT 출시 — 만 13~17세로 판단되면 자동 전환, 학습 모드·보호자 통제 포함 ([OpenAI 공식](https://openai.com/index/chatgpt-for-teens/))
- **그록 4.6 베드락 출시** — 8/19 xAI 그록 4.6, 아마존 베드락 정식 출시 — 컨텍스트 **50만** 토큰, 전 리전 지원 ([AWS 공식](https://aws.amazon.com/about-aws/whats-new/2026/08/amazon-bedrock-grok-4-6/))
- **GPT-5.6 Sol 가격 인하** — 8/21 오픈AI, API 가격 **20%** 넘게 인하 — 11월 21일까지 한시 적용, 앤트로픽·중국 모델과의 경쟁이 배경 (로이터, [Investing.com](https://www.investing.com/news/stock-market-news/openai-cuts-developer-pricing-for-frontier-gpt56-sol-model-by-more-than-20-4872186))

### 시장·투자

- **앤트로픽 IPO 준비** — 8/20 스페이스X 역대 기록(**858억–862억 달러**)을 매치하거나 넘는 규모로 이르면 이달 말 상장 서류 제출 준비라는 보도 — 2분기 매출 **115억 달러** 이상 ([Bloomberg](https://www.bloomberg.com/news/articles/2026-08-20/anthropic-expects-to-match-spacex-s-record-ipo-size-or-top-it))
- **엔비디아·풀사이드 딜** — 8/20 모델 개발 SW '모델 팩토리' 비독점 라이선스에 **60억 달러**, 별도 지분 투자 10억 달러(기업가치 120억 달러 평가) — 인수 대신 라이선스+인재영입 구조라는 보도 ([Bloomberg](https://www.bloomberg.com/news/articles/2026-08-20/nvidia-to-pay-ai-startup-poolside-a-6-billion-license-newcomer-says))
- **클링 매출 급증** — 8/19 콰이쇼우 2분기 실적: 영상생성 AI 클링 분기 매출 **8억5,000만 위안**(전년 대비 200% 넘게 증가), 글로벌 이용자 1억 명·224개국 ([Kuaishou Technology 공식](https://ir.kuaishou.com/news-releases/news-release-details/kuaishou-technology-announces-second-quarter-and-interim-2026))

### 국내

- **iHW 520억 시리즈A** — 8/19 국내 반도체 스타트업 iHW, 초저전력 AI 반도체로 시리즈A 유치 — 산업은행 등 13개 기관 참여 ([이코노미스트](https://economist.co.kr/article/view/ecn202608190042))
- **제품안전 AI 법안** — 8/23 국회, AI·빅데이터 기반 '지능형 제품안전 관리시스템' 구축법 발의 — 상시감시·플랫폼 차단 의무 포함 ([뉴스핌](https://www.newspim.com/news/view/20260823000091))

::: 출처
SK하이닉스 뉴스룸 — AI 시대 인재 선발·채용 개편 (7/30) | https://news.skhynix.co.kr/ai-talent-recruit-2026-02/ | TOP1 개편 내용
전자신문 — SK하이닉스 신입 채용 개편·접수 일정 (7/30) | https://www.etnews.com/20260730000120 | TOP1 접수 8/20–8/26
Bloomberg — 앤트로픽 IPO 규모 (8/20) | https://www.bloomberg.com/news/articles/2026-08-20/anthropic-expects-to-match-spacex-s-record-ipo-size-or-top-it | 시장·투자 브리핑
Bloomberg — 엔비디아·풀사이드 라이선스 (8/20) | https://www.bloomberg.com/news/articles/2026-08-20/nvidia-to-pay-ai-startup-poolside-a-6-billion-license-newcomer-says | 시장·투자 브리핑
Kuaishou Technology 공식 — 2026년 2분기 실적발표 (8/19) | https://ir.kuaishou.com/news-releases/news-release-details/kuaishou-technology-announces-second-quarter-and-interim-2026 | 시장·투자 브리핑
Claude Code 공식 What's new — Week 34 (8/17–8/21) | https://code.claude.com/docs/en/whats-new | /design 리서치 프리뷰
Digital Applied — Codex CLI 0.148 소개 (8월) | https://www.digitalapplied.com/blog/claude-code-codex-cli-agent-operator-changes-august | 커뮤니티 블로그 — 비단정 인용
The Hacker News — 에이전트 자기전파 연구 보도 (8/18) | https://thehackernews.com/2026/08/ai-mind-viruses-can-spread-between.html | 프리프린트 8/10 공개
OpenAI 공식 — ChatGPT for Teens (8/18) | https://openai.com/index/chatgpt-for-teens/
AWS 공식 — 베드락 그록 4.6 지원 (8/19) | https://aws.amazon.com/about-aws/whats-new/2026/08/amazon-bedrock-grok-4-6/
이코노미스트 — iHW 520억원 시리즈A (8/19) | https://economist.co.kr/article/view/ecn202608190042
Anthropic 공식 — 클로드 아카데미 출시 (8/20) | https://claude.com/blog/anthropics-approach-to-teaching-and-learning-ai
Investing.com(로이터) — GPT-5.6 Sol 가격 인하 (8/21) | https://www.investing.com/news/stock-market-news/openai-cuts-developer-pricing-for-frontier-gpt56-sol-model-by-more-than-20-4872186
뉴스핌 — 지능형 제품안전 관리시스템 구축법 발의 (8/23) | https://www.newspim.com/news/view/20260823000091
:::
