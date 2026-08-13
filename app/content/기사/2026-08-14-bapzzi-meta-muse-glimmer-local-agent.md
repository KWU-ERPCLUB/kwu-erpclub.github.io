---
title: 메타가 16개월 만에 가중치를 풀었다 — GPU 한 장에서 도는 에이전트 모델
author: bapzzi
date: 2026-08-14
시각: 05:20
source_url: https://research.meta.ai/blog/introducing-muse-glimmer-open-agentic-model
source_name: Meta AI Research · VentureBeat · Artificial Analysis
성격: 심층 분석
주제: 모델·플랫폼
설명: 8월 10일 메타가 300억 파라미터 모델 뮤즈 글리머를 아파치 2.0으로 공개했다 — 라이선스를 바꾼 이유, GPU 한 장이라는 조건, 독립 평가가 자체 발표와 갈리는 지점
태그: [메타, 오픈웨이트, 로컬모델, 에이전트, 라이선스]
---

::: 요약
- 8월 10일 메타 슈퍼인텔리전스랩이 300억 파라미터 모델 **뮤즈 글리머(Muse Glimmer)를** 공개했다. 라마 4 이후 첫 오픈웨이트 공개이고, 라이선스가 메타 자체 약관이 아닌 **아파치 2.0이다.**
- 조건은 GPU 한 장이다. 4비트로 압축해 **24GB VRAM에** 들어가고, 클라우드 API를 거치지 않고 내 기기에서 에이전트를 돌리는 쪽에 맞춰 설계했다.
- 메타 자체 벤치마크는 동급 우위를 보이지만, 독립 평가기관 Artificial Analysis의 종합 지수는 **35로** 더 작은 Qwen3.6 27B(38)보다 아래다. "동급 최고"는 항목마다 갈린다.
- 국내 금융권은 2026년 4월 시행세칙 개정으로 업무망 SaaS가 열렸으나 생성형 AI는 아직 예외 적용 대기다. 로컬 모델의 자리가 남아 있는 이유다.
:::

## 8월 10일에 나온 것

메타 슈퍼인텔리전스랩(Meta Superintelligence Labs)이 뮤즈 글리머를 공개했다. 300억 파라미터 밀집(dense) 구조이고, 가중치를 아파치 2.0 라이선스로 함께 풀었다.

용도를 한 문장으로 좁히면 *내 기기에서 상시로 도는 에이전트*다. 도구 호출, 여러 단계 작업 수행, 코드 작성·디버깅, 다른 모델 출력을 채점하는 LLM-as-a-judge 용도를 대상으로 잡았다.

배포처는 허깅페이스다. 로컬 실행 도구 쪽에서는 Ollama가 0.32.7 버전부터 지원하고, LM Studio·llama.cpp·MLX·ExecuTorch·vLLM·SGLang에서도 돌아간다.

하드웨어 조건이 이 발표의 핵심이다. 4비트로 압축해 가중치를 20GB 아래로 줄였고, KV 캐시¹와 이미지 인코더까지 얹어 24GB VRAM² 안에 들어간다.

| 항목 | 값 |
|---|---|
| 공개일 | 2026년 8월 10일 |
| 파라미터 | 300억(밀집) |
| 라이선스 | 아파치 2.0 |
| 최소 사양 | 24GB VRAM(RTX 4090·5090) 또는 Apple Silicon M3 Max 이상 |
| 4비트 가중치 크기 | 20GB 미만 |
| 배포 | 허깅페이스 · Ollama 0.32.7+ · LM Studio · llama.cpp · MLX · vLLM 등 |

속도 보완 장치도 함께 넣었다. DFlash라는 블록 단위 예측 방식이 토큰 16개를 한 번에 제안하고 본 모델이 병렬로 검증한다.

메타가 밝힌 가속 폭은 하드웨어마다 다르다. RTX 5090에서 3.1배, M5 Max에서 1.8배, M4 Max에서 1.5배다.

> **시사점 —** 이 발표에서 새로운 것은 성능 수치가 아니라 *실행 장소*다.
>
> 지금까지 쓸 만한 에이전트는 대부분 남의 서버에 있었다. 게이밍 PC 한 대에 들어가는 크기로 내려온 것은 데이터가 밖으로 나가지 않는 선택지가 생겼다는 뜻이다.

::: 용어
KV 캐시 | 모델이 앞서 읽은 문맥을 기억해 두는 메모리 — 대화가 길어질수록 커진다
VRAM | 그래픽카드에 붙은 전용 메모리 — 모델이 통째로 들어가야 실행된다
:::

## 왜 지금 메타가 다시 풀었나

메타의 마지막 오픈 공개는 라마(Llama) 계열이었다. Artificial Analysis는 이번 공개를 라마 4 이후 16개월 만의 오픈웨이트 공개로 집계했다.

그 사이에 메타는 방향을 바꿨다. 라마 4의 반응이 기대에 못 미친 뒤 AI 조직을 슈퍼인텔리전스랩으로 재편했고, 새 주력 모델 뮤즈 스파크(Muse Spark)는 폐쇄형으로 냈다.

업계에서는 이 흐름을 메타가 오픈소스 노선을 접은 것으로 읽었다는 평가가 나왔다. 이번 공개는 그 판단을 되돌리는 쪽이다.

라이선스가 그 차이를 가장 분명히 보여준다. 라마는 메타가 직접 쓴 약관이었고 사용자 수 상한과 용도 제한 조항이 붙어 있었다.

아파치 2.0에는 그런 조건이 없다. 상업적 이용·수정·재배포가 열려 있고, 특허 관련 조항까지 표준 문안으로 정리돼 있다.

배경에는 오픈웨이트 진영의 구도 변화가 있다. 알리바바 Qwen 계열을 비롯한 중국계 모델이 오픈웨이트 상위권을 채우면서, 서구 진영에서 상업적으로 자유롭게 쓸 수 있는 중형 모델의 빈칸이 커졌다.

> **시사점 —** 라이선스는 법무 이슈로 보이지만 실제로는 도입 속도를 결정한다.
>
> 사용자 수 상한이나 용도 제한이 붙은 모델은 기업 법무 검토에서 한 번 더 멈춘다. 아파치 2.0은 이미 사내에 선례가 쌓여 있어 검토 기간 자체가 짧다.

## 용어 지도 — 오픈웨이트·양자화·에이전틱

이 소식을 읽는 데 필요한 개념은 넷이다. 순서대로 정리하면 지도가 그려진다.

**오픈웨이트¹는** 모델의 학습된 수치(가중치)를 내려받아 자기 서버·PC에서 돌릴 수 있게 공개한 것이다. 학습 데이터와 코드까지 다 공개하는 오픈소스와는 범위가 다르다.

**양자화²는** 그 수치의 정밀도를 낮춰 파일을 줄이는 작업이다. 300억 파라미터 모델은 원래 55GB 넘는 메모리를 요구하지만, 4비트로 줄이면 20GB 아래로 내려간다.

정밀도를 낮추면 품질이 조금 깎인다. 그 손실을 감수하고 실행 가능성을 사는 거래다.

**에이전틱³** 모델은 답변 한 번으로 끝내지 않고 도구를 부르고 결과를 보고 다음 단계를 정하는 쪽에 맞춰 학습한 모델이다. 뮤즈 글리머는 도구 호출이 실패했을 때 원인을 진단하고 다시 시도하도록 학습했다고 메타는 밝혔다.

**MCP⁴는** 그 도구 연결의 규격이다. 모델이 파일·검색·사내 시스템 같은 외부 도구를 같은 방식으로 부를 수 있게 하는 약속이고, 이번 평가에도 MCP 기반 벤치마크가 들어갔다.

| 개념 | 한 줄 정의 | 이 소식과의 관계 |
|---|---|---|
| 오픈웨이트 | 가중치를 내려받아 직접 실행 | 데이터를 외부로 안 보내는 배치가 가능해진다 |
| 양자화 | 정밀도를 낮춰 용량 축소 | 24GB GPU 한 장이라는 조건을 만든 기술 |
| 에이전틱 | 도구를 부르며 여러 단계 수행 | 이 모델이 겨냥한 용도 |
| MCP | 도구 연결 표준 규격 | 평가 항목이자 실제 연결 방식 |

::: 용어
오픈웨이트 | 가중치만 공개 — 학습 데이터·코드까지 여는 오픈소스와 구분된다
양자화 | 수치 정밀도를 낮춰 모델 용량을 줄이는 기법
에이전틱 | 도구 호출·다단계 수행에 맞춰 학습된 모델 성격
MCP | Model Context Protocol — 모델이 외부 도구를 부르는 연결 규격
:::

## 수치는 어디까지 사실인가

메타가 낸 벤치마크부터 본다. 비교 대상은 비슷한 크기의 오픈 모델인 Gemma4-31B와 Qwen3.6-27B다.

| 벤치마크 | 뮤즈 글리머 | Gemma4-31B | Qwen3.6-27B |
|---|---|---|---|
| MCP Atlas | 75.5 | 54.2 | 62.5 |
| DeepSearch QA | 74.6 | — | — |
| SWE-Bench Pro | 51.2 | 36.9 | 50.2 |

도구 연결(MCP Atlas)에서 격차가 가장 크고, 코드 수정(SWE-Bench Pro)은 Qwen3.6-27B와 1.0점 차다. 항목별로 우위 폭이 다르다.

절대 수준을 보여주는 항목도 있다. 은행 업무 시나리오를 다단계로 처리하는 Tau3-Banking에서 뮤즈 글리머는 **24%를** 기록했다.

같은 항목에서 Gemini 3.5 Flash-Lite가 18%, Qwen3.6-27B가 17%다. 상대적으로는 앞서지만, 열 번 시켜 두세 번 끝낸다는 뜻이기도 하다.

여기까지는 모두 메타가 발표한 수치다. 독립 평가는 다르게 읽힌다.

Artificial Analysis는 자체 종합 지표인 Intelligence Index에서 뮤즈 글리머에 **35점을** 매겼다. 같은 크기 Gemma 4 31B보다 5점 위이고, 1조 파라미터급 Kimi K2.5(36)와 사실상 같은 자리다.

다만 더 작은 Qwen3.6 27B(38)와 Ling 3.0 Flash(38)에는 뒤진다. 공개 범위·투명도를 재는 Openness Index는 44점이다.

::: 수치
35 | Artificial Analysis Intelligence Index — 뮤즈 글리머 | Artificial Analysis
38 | 같은 지수 Qwen3.6 27B (더 작은 모델) | Artificial Analysis
24% | Tau3-Banking 다단계 은행 업무 완수율 | Meta 발표
:::

> **시사점 —** 벤더 발표와 독립 평가가 갈릴 때 읽는 순서가 있다.
>
> 벤더 수치는 자기가 잘하는 항목을 고른다. 종합 지수는 그 선택을 평탄화한다. *둘 다 보고 나서야 "무엇에 강한 모델인가"가 남는다.*

## 로컬 에이전트가 걸리는 흐름

이 모델이 겨냥한 자리는 프런티어 모델의 대체가 아니다. 클라우드에 못 보내는 데이터를 다루는 구간이다.

국내 상황에 대보면 위치가 분명해진다. 금융권은 2026년 4월 20일부터 전자금융감독규정 시행세칙 개정안이 시행되면서 내부 업무망에서 SaaS를 쓰는 길이 열렸다.

다만 그 범위에 생성형 AI가 아직 들어가 있지 않다. 금융당국은 SaaS에 이어 생성형 AI 도입에도 망분리 예외를 적용하는 방향으로 협의를 진행하겠다고 밝힌 단계다.

공공은 별도로 CSAP¹ 인증 관문이 앞에 선다. 이 두 축 때문에 국내에서는 폐쇄망 안에 모델을 직접 두는 sLLM² 구축이 계속돼 왔다.

비용 축도 같이 움직인다. 클라우드 API는 쓴 만큼 내지만, 로컬 실행은 GPU를 먼저 사고 전기를 내는 구조다.

| 구분 | 클라우드 API | 로컬 실행 |
|---|---|---|
| 비용 형태 | 사용량 과금 | 장비 선투자 + 전력 |
| 데이터 | 외부 전송 | 기기·사내망 안 |
| 성능 상한 | 최상위 모델 | 24GB급에 들어가는 크기까지 |
| 운영 부담 | 벤더가 짐 | 설치·업데이트 자체 부담 |

경계선은 여기다. 최고 난도 작업은 여전히 클라우드 쪽이고, 반복적이고 데이터 민감도가 높은 작업이 로컬 쪽으로 넘어간다.

> **시사점 —** "로컬에서 돈다"는 문장은 성능 선언이 아니라 *배치 선택지의 추가*다.
>
> 조직이 모델을 고를 때 성능·가격 다음에 오는 질문이 "어디에 둘 수 있나"다. 이번 공개는 그 세 번째 칸을 넓혔다.

::: 용어
CSAP | 클라우드 보안인증 — 공공기관에 클라우드 서비스를 납품하려면 받아야 하는 국내 인증
sLLM | 오픈웨이트 모델을 특정 업무에 맞춰 경량화·튜닝해 사내에 두는 방식
:::

## SO WHAT

**닿는 경로와 시차.** 학부생에게 이 소식이 닿는 경로는 두 갈래다. 하나는 진로 쪽이다 — 금융·공공을 고객으로 둔 SI·솔루션 기업에서 "폐쇄망 안에 모델을 어떻게 앉히나"가 실제 업무 주제로 남는다.

다른 하나는 도구 쪽인데, 이쪽은 시차가 있다. 24GB VRAM은 RTX 4090·5090급 그래픽카드나 상위 맥 사양이고, 일반적인 노트북에는 없다.

기업 도입은 더 느리다. 금융권 생성형 AI 망분리 예외는 아직 협의 단계이고, 공공은 CSAP 심사가 앞에 선다. 회사 규모에 따라 GPU 조달 여력도 갈린다.

**지금 해당 없는 것.** "내 노트북에서 도는 AI"라는 문장이 지금 당장 모두에게 적용되지는 않는다. 24GB VRAM 조건을 못 채우면 이 모델은 안 돌아간다.

성능도 최상위 모델과 같지 않다. 은행 업무 다단계 처리 완수율이 24%라는 것은, 사람이 확인하지 않고 맡길 수 있는 상태가 아니라는 뜻이다.

라이선스가 아파치 2.0이라는 사실도 개인에게는 큰 차이를 만들지 않는다. 이 조항이 실제로 작동하는 곳은 상업 배포를 검토하는 기업의 법무 단계다.

**지금 할 수 있는 것.** 비용 0원으로 확인 가능한 것부터 적는다.

첫째, 본인 장비의 VRAM 용량을 확인한다. 24GB 미만이면 이 모델은 대상이 아니고, 그 사실 자체가 "로컬 AI"라는 표현의 실제 조건을 체감하는 자료다.

둘째, 조건이 되는 장비가 있다면 Ollama로 설치해 같은 작업을 클라우드 모델과 나란히 시켜 본다. 속도·품질·실패 지점이 어디서 갈리는지가 표로 남는다.

셋째, 모델 뉴스를 읽을 때 네 칸을 채우는 습관을 만든다 — 라이선스가 무엇인가, 어디서 돌릴 수 있나, 벤더 수치인가 독립 수치인가, 무슨 작업에 강한가. 이번 건은 아파치 2.0 · 24GB GPU · 둘 다 있음 · 도구 호출로 채워진다.

넷째, 국내 규제 축을 하나만 골라 현재 판본을 확인해 둔다. 금융이면 전자금융감독규정 시행세칙, 공공이면 CSAP다. 해외 발표가 국내에서 언제 실행 가능한지는 이 문서들이 정한다.

::: 출처
Meta AI Research — Introducing Muse Glimmer: An Open Agentic Model That Runs on Your Device | https://research.meta.ai/blog/introducing-muse-glimmer-open-agentic-model | 공식 발표·설계 목적·에이전틱 학습
VentureBeat — Meta returns to open source with Muse Glimmer, an Apache 2.0 licensed 30B parameter AI model optimized for agents | https://venturebeat.com/technology/meta-returns-to-open-source-with-muse-glimmer-an-apache-2-0-licensed-30b-parameter-ai-model-optimized-for-agents-available-now | 라이선스 전환 배경·라마 4 이후 노선 변화
Artificial Analysis — Muse Glimmer: Benchmarks and analysis | https://artificialanalysis.ai/articles/muse-glimmer | Intelligence Index 35·Openness Index 44·동급 비교
MarkTechPost — Meta AI Releases Muse Glimmer: A 30B Open-Weights Agentic Model That Runs on One Consumer GPU | https://www.marktechpost.com/2026/08/10/meta-ai-releases-muse-glimmer/ | 8/10 공개일·30B 밀집·용도
Phoronix — Meta Publishes Muse Glimmer As 30B Open Agentic Model | https://www.phoronix.com/news/Meta-Muse-Glimmer | 공개 사실·오픈 배포
Hardware Busters — Meta's Muse Glimmer Is a 30B Model Engineered to Fit a 24GB Graphics Card | https://hwbusters.com/news/metas-muse-glimmer-is-a-30b-model-engineered-to-fit-a-24gb-graphics-card/ | 4비트·20GB 미만·24GB VRAM 조건
Ollama — Muse Glimmer from Meta Superintelligence Labs is now available | https://ollama.com/blog/muse-glimmer | 로컬 실행 지원·설치 경로
Forbes — Meta Turns Muse Glimmer Into A Local AI Model That Undercuts The Cloud | https://www.forbes.com/sites/jonmarkman/2026/08/11/meta-unveils-muse-glimmer-a-30b-parameter-ai-model-that-runs-locally/ | 클라우드 대비 로컬 실행의 시장 의미
ZDNet Korea — 금융권 AI 도입 막던 망분리 규제 완화…SaaS업계 '화색' | https://zdnet.co.kr/view/?no=20260420161504 | 2026-04-20 시행세칙 개정 시행·업무망 SaaS 허용
법무법인(유) 세종 — 금융회사 SaaS 이용 관련 망분리 규제 개선의 주요 내용과 시사점 | https://www.shinkim.com/kor/media/newsletter/3105 | 개정 시행세칙 해설·생성형 AI 예외는 후속 협의 단계
:::
