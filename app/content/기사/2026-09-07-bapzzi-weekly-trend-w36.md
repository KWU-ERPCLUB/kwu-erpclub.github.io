---
title: 주간 AI 트렌드 — 8월 6주
author: bapzzi
date: 2026-09-07
시각: 09:22
source_url: https://openai.com/index/gpt-6-astra/
source_name: OpenAI · LG전자 · Google 외
성격: 트렌드
보관: true
주제: 시장·생태계
시리즈: weekly
설명: 매주 월요일 발행하는 주간 AI 트렌드. 8/31–9/6 소식.
태그: [GPT-6, LG전자, 제미나이, 클로드, 채용]
---

::: 요약
- 8/31–9/6 한 주 요약. 오픈AI가 9월 3일 최상위 모델 *GPT-6 아스트라*를 출시했고, LG전자는 8월 31일부터 국내 12개 대학을 돌며 로봇·AI 신사업 인재 확보에 나섰다.
- 구글은 9월 4일부터 안드로이드 구글 어시스턴트를 순차 종료하고 제미나이로 강제 전환을 시작했다. 안드로이드 이용자라면 이미 겪고 있을 변화다.
- 앤스로픽·구글의 신모델 공개, 코딩 에이전트 보안 취약점, 국내 GPU 공급 계약 등은 키워드 브리핑에 담았다.
:::

## 이번 주 TOP 3

**1. 오픈AI, 최상위 모델 'GPT-6 아스트라(GPT-6 Astra)' 공식 출시** (9/3) — 오픈AI가 9월 3일 신모델 GPT-6 아스트라를 공개했다. 컴퓨터 조작·브라우징·소프트웨어 엔지니어링에서 최고 수준을 기록했고 FrontierMath Tier4에서 **98%**, 취약점 탐지 벤치마크 ExploitBench에서 **100%** 점수를 받았다([OpenAI 공식](https://openai.com/index/gpt-6-astra/)). 오픈AI 자체 안전 체계(프리페어드니스 프레임워크¹)상 처음으로 '치명적(Critical)' 사이버보안 등급에 도달한 모델이기도 하다 — 승인된 방어팀부터 먼저 접근하고, 챗GPT 플러스·프로·비즈니스·엔터프라이즈와 API·애저·베드록에는 며칠에 걸쳐 순차 개방된다([OpenAI 안전 개요](https://openai.com/index/safety-overview-gpt-6-astra/)). *속도보다 안전 검증에 지면을 더 할애한 발표라는 평가가 나온다*(커뮤니티).

**2. LG전자, 국내 12개 대학 순회하며 로봇·AI 인재 확보** (8/31) — LG전자가 8월 31일 한국과학기술원(KAIST)을 시작으로 서울대·고려대·성균관대·연세대·포항공대 등 국내 12개 대학을 돌며 로봇·냉난방공조(HVAC) 신사업 인재를 확보하는 채용 상담회에 나섰다([스포츠경향](https://sports.khan.co.kr/article/202608311104003/)). 로봇사업본부장이 직접 인재 양성을 챙기는 행보로, 9월 9일부터는 북미 6개 대학도 순회한다(같은 기사). 삼성전자·SK 등도 9월 초중순 하반기 공채를 이어갈 예정이어서 국내 대기업의 AI·로봇 인재 확보 경쟁은 이번 주 이후로도 계속될 전망이다. *채용 상담회가 학교 캠퍼스까지 내려온 것은 지원 전 단계에서부터 실무 역량을 직접 확인하려는 흐름으로 읽힌다*.

**3. 구글, 안드로이드 어시스턴트 종료·제미나이 전환 시작** (9/4) — 구글이 9월 4일부터 안드로이드·웨어OS의 구글 어시스턴트를 단계적으로 종료하고 제미나이로 대체하기 시작했다([9to5Google](https://9to5google.com/2026/08/04/google-assistant-september-2026-shutdown/)). 스마트폰·태블릿·웨어OS 워치·헤드폰·안드로이드 오토 차량이 대상이며, 전환에는 몇 주가 걸릴 수 있고 완료 후에는 되돌릴 방법이 없다(같은 기사). 구글 빌트인이 탑재된 차량은 이번 종료 대상에서 빠졌다. *일부 어시스턴트 기능이 아직 제미나이에 없다는 점은 감안해야 한다*.

::: 용어
프리페어드니스 프레임워크 | 오픈AI가 자사 모델의 생물·화학·사이버보안 등 위험 수준을 자체 평가해 등급을 매기는 안전 점검 체계
:::

## 키워드 브리핑

### 도구·워크플로

- **GitSpawn 취약점** — 9/1 매니폴드시큐리티가 클로드 코드·코덱스·커서·그록 빌드 등 코딩 에이전트 **7개에서**, 저장소의 git 설정만으로 승인 없이 임의 코드가 실행되는 결함 **8건을** 공개했다. 재검증 시점(9/1) 기준 4건은 미패치였다는 평가다(커뮤니티) ([The Hacker News](https://thehackernews.com/2026/09/malicious-git-configs-can-make-claude.html))
- **GitHub 트렌딩 신규 진입** — 9/1–9/3 사이 불필요한 코드 작성을 피하는 에이전트 '포니테일(Ponytail)', 소비자 하드웨어에서 경량 모델을 구동하는 '콜리브리(Colibri)'가 트렌딩 상위 20위에 새로 올랐다는 집계다(커뮤니티) ([GitHub Trending Digest](https://dev.to/muildev/github-trending-digest-2026-09-03-46c7))

### 모델·공식 발표

- **클로드 페이블 5.1·미토스 5.1(Claude Fable 5.1·Mythos 5.1)** — 9/1 앤스로픽이 코딩·지식노동용 신모델 2종을 출시했다. 페이블 5.1은 전체 공개, 미토스 5.1은 사이버보안·생명과학 분야 신뢰 프로그램 대상 한정이다. 캐시 읽기 가격 인하로 고강도 에이전트 작업 비용이 최대 **45%** 낮아졌다 ([Anthropic 공식](https://www.anthropic.com/claude-fable-and-mythos-5-1))
- **제미나이 3.8 플래시(Gemini 3.8 Flash)** — 9/2 구글이 장기 소프트웨어 엔지니어링·자율 에이전트용 플래시 모델을 정식 출시했다. 컨텍스트 창은 **100만** 토큰이다 ([Google 공식 블로그](https://blog.google/innovation-and-ai/models-and-research/gemini-models/3-8-flash-and-3-8-flash-cyber/))
- **클로드 커머스 에이전트 블루프린트** — 9/2 앤스로픽이 쇼핑·판매자 에이전트 구축용 오픈소스 청사진을 아파치 2.0 라이선스로 공개했다. 쇼피파이·비자·마스터카드가 초기 사용자로 참여했다 ([GitHub](https://github.com/anthropics/commerce-agents))

### 시장·투자

- **베슬AI-SK바이오팜** — 9/2 베슬AI가 SK바이오팜에 엔비디아 B200 GPU **128장** 규모 컴퓨팅 자원을 공급하는 계약을 체결했다고 밝혔다. 신약 개발용 자체 AI 인프라 확보가 목적이다 ([머니투데이](https://www.mt.co.kr/thebio/2026/09/02/2026090209422264304))

### 국내

- **카카오 리센느 캠페인** — 9/2 카카오가 아이돌 그룹 리센느를 앞세워 '카나나'의 통화 요약·일정 정리 기능을 알리는 이용자 캠페인을 시작했다. 영상은 9월 한 달간 순차 공개된다 ([한국경제](https://www.hankyung.com/article/202609028958g))

### 크리에이티브·미디어

- **구글 픽스(Google Pics)** — 9/1 구글이 나노바나나 프로(제미나이 3 프로 이미지) 기반 워크스페이스 이미지 생성·편집 도구를 출시했다. 개체 단위 편집·텍스트 교체·2K·4K 업스케일을 지원하며 pics.new에서 바로 쓸 수 있다 ([Google Workspace 공식](https://workspaceupdates.googleblog.com/2026/09/google-pics-brings-pro-level-ai-image-creation-and-editing-to-Google-Workspace.html))
- **경북 GAMFF** — 9/3 구미에서 개막한 '2026 경북 국제 AI·메타버스 영상제'가 9/5까지 구미·포항·경산 3개 도시에서 열렸다. 97개국에서 역대 최대인 **3,403편이** 출품됐다 ([시사저널](https://www.sisajournal.com/news/articleView.html?idxno=386053))

::: 출처
OpenAI 공식 — GPT-6 Astra: A new generation of intelligence (9/3) | https://openai.com/index/gpt-6-astra/ | TOP1
OpenAI 공식 — Safety overview: GPT-6 Astra (9/3) | https://openai.com/index/safety-overview-gpt-6-astra/ | TOP1 안전 등급
스포츠경향 — 기계공학 전공한 LG전자, 류재철 '로봇, AI 인재 양성 직접 챙긴다' (8/31) | https://sports.khan.co.kr/article/202608311104003/ | TOP2
9to5Google — Google Assistant shutting down on Android and Wear OS in September (8/4 보도, 9/4 시행) | https://9to5google.com/2026/08/04/google-assistant-september-2026-shutdown/ | TOP3
The Hacker News — Malicious .git Configs Can Make Claude, Codex, Cursor, and Other AI Agents Run Attacker Code (9/1) | https://thehackernews.com/2026/09/malicious-git-configs-can-make-claude.html | 도구·워크플로(커뮤니티)
GitHub Trending Digest — 2026-09-03 | https://dev.to/muildev/github-trending-digest-2026-09-03-46c7 | 도구·워크플로(커뮤니티)
Anthropic 공식 — Introducing Claude Fable 5.1 and Claude Mythos 5.1 (9/1) | https://www.anthropic.com/claude-fable-and-mythos-5-1 | 모델·공식 발표
Google 공식 블로그 — Introducing Gemini 3.8 Flash and 3.8 Flash Cyber (9/2) | https://blog.google/innovation-and-ai/models-and-research/gemini-models/3-8-flash-and-3-8-flash-cyber/ | 모델·공식 발표
GitHub — anthropics/commerce-agents (9/2) | https://github.com/anthropics/commerce-agents | 모델·공식 발표
머니투데이 — SK바이오팜, 엔비디아 AI 가속기 'B200' 128장 도입 (9/2) | https://www.mt.co.kr/thebio/2026/09/02/2026090209422264304 | 시장·투자
한국경제 — 리센느가 알려주는 카톡 AI…카카오, 새 캠페인 시작 (9/2) | https://www.hankyung.com/article/202609028958g | 국내
Google Workspace 공식 — Google Pics brings pro-level AI image creation and editing to Google Workspace (9/1) | https://workspaceupdates.googleblog.com/2026/09/google-pics-brings-pro-level-ai-image-creation-and-editing-to-Google-Workspace.html | 크리에이티브·미디어
시사저널 — [경북 24시] 경북 AI 영상제 막 올라…97개국 3403편 역대 최대 (9/3) | https://www.sisajournal.com/news/articleView.html?idxno=386053 | 크리에이티브·미디어
:::
