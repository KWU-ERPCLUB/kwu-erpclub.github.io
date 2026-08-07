---
title: 최상위급 모델이 처음 오픈웨이트로 — 알리바바 Qwen3.8-Max
author: bapzzi
date: 2026-08-05
시각: 03:20
source_url: https://www.alibabacloud.com/en/press-room/alibaba-unveils-qwen3-8-max
source_name: Alibaba Cloud · VentureBeat · SCMP
성격: 심층 분석
주제: 모델·플랫폼
설명: 8월 3일 알리바바가 2.4조 파라미터 Qwen3.8-Max를 공개하고 다음 주 가중치를 푼다 — Max급 최초 오픈웨이트가 기업의 모델 선택 계산을 어떻게 바꾸나
태그: [알리바바, Qwen, 오픈웨이트, 모델가격, 에이전트]
이미지: /img/covers/qwen38-max.jpg
이미지설명: 알리바바 Qwen 공식 키비주얼 — 이번에 Qwen3.8-Max를 공개하고 다음 주 가중치를 푸는 모델 제품군
---

::: 요약
- 8월 3일 알리바바가 플래그십 **Qwen3.8-Max를** 공개했다. 2.4조 파라미터·100만 토큰 컨텍스트, 컴퓨터 조작 계열 벤치마크에서 GPT·Claude 최상위를 앞선 수치를 냈다.
- 핵심은 성능이 아니라 배포 방식이다. *Max급 모델을 오픈웨이트로 푸는 것은 알리바바에서 처음*이고, 가중치는 다음 주 공개 예정이다.
- 가격이 입력 100만 토큰당 $2·출력 $6다. 같은 급 폐쇄형의 1/3~1/5 수준이라 "성능이 되면서 싼 선택지"라는 칸이 새로 생겼다.
:::

## 8월 3일에 나온 것

알리바바가 Qwen 계열의 새 플래그십 Qwen3.8-Max를 공개했다. 알리바바 클라우드 모델 스튜디오 API로 전 세계 개발자에게 먼저 열렸다.

스펙부터 정리하면 규모가 크다. 총 2.4조 파라미터¹의 희소 MoE² 구조이고, 추론할 때 실제로 켜지는 것은 950억 파라미터다.

컨텍스트³는 100만 토큰이다. 한 번의 질문에 약 75만 단어 분량을 통째로 넣을 수 있다.

| 항목 | 값 |
|---|---|
| 총 파라미터 | 2.4조 |
| 추론 시 활성 파라미터 | 950억 |
| 컨텍스트 창 | 100만 토큰 |
| 구조 | 희소 MoE (Qwen 3.5 아키텍처 기반) |
| 입출력 | 멀티모달 — 문서·영상·라이브 스트림 처리 |
| API 가격 | 입력 $2 / 출력 $6 (100만 토큰당) |
| 가중치 공개 | 다음 주 예정 (Hugging Face·ModelScope) |

같은 날 알리바바는 기업용 에이전트 플랫폼 QwenWork도 공개 테스트에 넣었다. 기존에 따로 있던 QoderWork·MuleRun·Wukong을 하나로 합친 형태다.

모델만 내놓은 발표가 아니라는 뜻이다. 모델과 그 모델을 업무에 붙이는 창구를 같이 열었다.

::: 용어
파라미터 | 모델이 학습으로 얻은 내부 수치. 많을수록 담을 수 있는 지식·패턴이 늘지만 그만큼 계산 비용도 커진다
MoE | Mixture of Experts. 모델 안을 여러 전문가 블록으로 나눠 두고 질문마다 일부만 켜는 구조. 총 규모는 크되 실제 계산량은 작게 유지한다
컨텍스트 | 한 번의 대화·요청에서 모델이 동시에 볼 수 있는 글의 최대 길이
:::

> **시사점 —** 총 2.4조와 활성 950억을 구분해서 읽어야 한다.
>
> 앞 숫자는 모델의 크기이고 뒤 숫자는 한 번 굴릴 때의 비용에 가깝다. 요즘 대형 모델 발표에서 두 숫자가 같이 나오는 이유다.

## 성능은 어디까지 사실인가

알리바바가 제시한 표는 항목별로 갈린다. 한 방향으로 정리되지 않는다는 점이 오히려 판단에 도움이 된다.

강한 쪽은 *컴퓨터를 직접 조작하는 계열*이다. OSWorld-Verified¹에서 **86.1로** GPT-5.6 Sol Max(83.2)와 Claude Fable 5(85.0)를 앞섰다는 결과가 보도됐다.

터미널 조작 계열도 비슷하다. Terminal-Bench 2.1에서 **86.6으로** Claude Opus 4.8·Fable 5(각 84.6)를 앞서고 GPT-5.6 Sol Max(88.8)에 뒤진다.

약한 쪽은 소프트웨어 수정 과제다. 난도가 높은 SWE-bench Pro²에서 **67.7로** Fable 5(80.0)에 12점 이상 벌어진다.

| 벤치마크 | 측정 대상 | Qwen3.8-Max | 비교 |
|---|---|---|---|
| OSWorld-Verified | 컴퓨터·앱 조작 에이전트 | **86.1** | Fable 5 85.0 / GPT-5.6 Sol Max 83.2 |
| Terminal-Bench 2.1 | 터미널 작업 수행 | **86.6** | Opus 4.8·Fable 5 84.6 / Sol Max 88.8 |
| PaperBench | 논문 재현 | **93.0** | 비교군 중 최고 |
| SWE-bench Pro | 실제 코드 수정 | 67.7 | Fable 5 80.0 / Opus 4.8 69.2 / Sol 64.6 |

사람 평가 기반의 아레나³ 순위도 같이 봐야 한다. LMArena 텍스트 부문 5위(1,496점), 비전 부문 2위(1,305점)로 집계됐고, 비전 1위는 Fable 5(1,318점)다.

프런트엔드 코드 아레나에서는 1,668점으로 4위라는 집계가 공개됐다. Claude Opus 5(Max) 1,705점, Kimi K3(Max) 1,676점 뒤다.

주의할 점이 하나 있다. 위 수치의 상당수가 *알리바바가 자체 공개한 표*를 각 매체가 옮긴 것이고, 독립 재현 결과가 쌓이기 전이라는 지적이 함께 나온다.

::: 용어
OSWorld-Verified | AI가 실제 운영체제와 앱을 마우스·키보드처럼 조작해 과제를 끝내는지 재는 시험
SWE-bench Pro | 실제 오픈소스 저장소의 버그 리포트를 주고 코드를 고쳐 테스트를 통과시키는지 재는 시험의 상위 난도판
아레나 | 사람이 두 모델의 답을 블라인드로 비교 투표해 매기는 순위. 정답이 하나인 시험과 달리 선호도를 잰다
:::

> **시사점 —** "1등이냐"는 질문은 쓸모가 적다. 항목별로 순위가 뒤집히기 때문이다.
>
> 실무에서 의미 있는 질문은 *"내가 시킬 일에 해당하는 항목에서 어떤가"*다. 문서·화면을 다루는 사무 자동화라면 조작 계열 점수가, 코드 유지보수라면 SWE 계열 점수가 기준이다.

## 왜 지금 열었나

배경은 세 겹이다. 하나씩 떼어 보면 이번 결정이 갑작스럽지 않다.

첫째, 중국 모델 진영의 오픈웨이트⁴ 경쟁이 가열됐다. 문샷AI의 Kimi K3가 오픈웨이트로 먼저 나왔고, 알리바바의 프리뷰 발표가 그 며칠 뒤였다.

둘째, 알리바바 자신의 노선 복귀다. 올해 초 몇몇 플래그십을 비공개로 돌렸던 회사가 이번에 Max급을 처음 개방 대상으로 삼았다.

셋째, 클라우드 사업의 유인이 있다. 가중치를 풀어 생태계를 넓혀도 실제 대규모 추론은 결국 클라우드에서 돌아간다.

가격 구조가 이 계산을 드러낸다. 입력 $2·출력 $6은 같은 급 폐쇄형 대비 확연히 낮다.

| 모델 | 입력 (100만 토큰) | 출력 (100만 토큰) |
|---|---|---|
| Qwen3.8-Max | **$2** | **$6** |
| GPT-5.6 Sol | $5 | $30 |
| Claude Fable 5 | $10 | $50 |

출력 단가 기준으로 Fable 5의 약 1/8, GPT-5.6 Sol의 1/5이다. 캐시 적중 시 입력은 $0.25로 더 내려간다.

에이전트 작업은 출력 토큰을 대량으로 쓴다. 출력 쪽 격차가 큰 만큼 자동화 용도에서 체감 차이가 커지는 구조다.

::: 용어
오픈웨이트 | 모델 내부 값(가중치)을 공개해 누구나 내려받아 자기 환경에서 돌리고 고칠 수 있게 한 배포 방식. 학습 데이터·코드까지 다 공개하는 완전 오픈소스와는 다르다
:::

> **시사점 —** 성능 경쟁이 가격 경쟁으로 번지는 국면이 이어지고 있다.
>
> 도입 검토에서 "성능은 되는데 비싸서 못 한다"는 문장이 걸리는 작업 범위가 계속 줄어든다.

## 오픈웨이트라는 말의 함정

여기서 오해가 자주 생긴다. "가중치를 푼다 = 우리 회사 서버에 올려 쓸 수 있다"로 읽으면 어긋난다.

2.4조 파라미터·활성 950억은 일반 기업의 자체 운영 범위 밖이다. 이미 6,850억 파라미터급 모델도 자체 호스팅이 상당한 인프라 사업으로 평가되는데, 이번 모델은 그보다 3배 이상 크다.

현실적인 자체 운영 후보는 같이 예고된 소형 버전 쪽이라는 관찰이 나온다. 대형은 여전히 API로 쓰게 된다.

라이선스도 아직 확정 정보가 아니다. Qwen 3.5·3.6이 Apache 2.0으로 공개됐던 전례가 있으나, 3.8 계열 라이선스 문서는 공개 시점 기준으로 게시되지 않았다.

그러면 오픈웨이트의 실익은 무엇인가. 세 가지가 남는다.

| 실익 | 내용 | 누가 체감하나 |
|---|---|---|
| 가격 압력 | 대체재가 생기면 폐쇄형 가격이 따라 내린다 | 모든 사용 조직 |
| 공급자 선택권 | 여러 클라우드·호스팅 업체가 같은 모델을 서비스 | 조달·계약 담당 |
| 데이터 통제 | 규제 산업은 폐쇄망 배치를 검토할 수 있다 | 금융·공공·의료 |

정리하면 *오픈웨이트의 1차 효과는 자체 호스팅이 아니라 협상력*이다. 대다수 조직은 여전히 API로 쓰되 값이 내려간 API를 쓰게 된다.

> **시사점 —** 뉴스에서 "오픈소스 모델"이라는 표현을 보면 두 가지를 나눠 확인해야 한다.
>
> 가중치가 실제로 올라왔는지, 그리고 그 크기를 감당할 환경이 우리에게 있는지다. 둘 중 하나만 빠져도 "쓸 수 있다"는 결론은 성립하지 않는다.

## 다른 흐름과 겹쳐 보기

이번 건은 단독 사건이 아니라 세 흐름의 교차점에 있다.

첫째, 오픈웨이트 규제 논쟁이다. 7월 24일 엔비디아·마이크로소프트·메타 등 25개사가 오픈웨이트 규제에 신중해야 한다는 공동서한을 냈다는 보도가 있었다.

가중치가 풀리면 회수가 불가능하다는 점이 논쟁의 핵심이다. 성능 최상위권이 개방될수록 이 논쟁의 온도가 올라간다.

둘째, EU AI법의 범용 AI 모델 조항이다. 8월 2일부터 EU 집행위의 집행·제재 권한이 가동됐고, 범용 모델 제공자에게 문서화·투명성 의무가 걸린다.

오픈웨이트 배포자도 이 프레임 밖이 아니다. EU 시장에 닿으면 국적과 무관하게 적용된다.

셋째, 국내 소버린 AI 흐름이다. 국산 NPU·GPU 인프라를 구독형으로 파는 상품이 국내 IT서비스 기업에서 잇따라 나오고 있다.

이 인프라 위에 얹을 모델로 개방형 대형 모델은 유력한 후보가 된다. 폐쇄형만 있으면 인프라를 국산으로 깔아도 모델 종속은 남기 때문이다.

> **시사점 —** 모델 뉴스를 모델 성능으로만 읽으면 절반이다.
>
> *어디에 올릴 수 있는가(인프라), 무엇을 지켜야 하는가(규제), 얼마인가(가격)*가 같이 움직인다. 이번 발표는 이 셋을 한꺼번에 건드렸다.

## 거리 재기

먼저 거리부터. 이 모델을 국내 조직이 실제 업무에 붙이는 데는 관문이 있다 — 중국 클라우드 경유 시 개인정보 국외이전 검토, 금융·공공이면 감독규정·CSAP가 앞에 선다. 대부분의 국내 도입 검토는 여기서 멈추고, 오픈웨이트 자체 배치가 그 우회로가 될지는 가중치·라이선스가 실제로 풀린 뒤의 문제다. 학부생이 2.4조 파라미터를 직접 돌릴 일도 없다.

그 전제에서, 당장 가져갈 것은 두 가지다. 판정 기준 하나, 실습거리 하나다.

먼저 판정 기준. 모델 출시 뉴스를 볼 때 아래 다섯 칸을 채워 보면 중요도가 대체로 갈린다.

| 확인 칸 | 이번 건의 답 |
|---|---|
| 어떤 작업에 강한가 | 컴퓨터·터미널 조작 계열. 코드 수정은 최상위 대비 열위 |
| 얼마인가 | 출력 기준 Fable 5의 약 1/8 |
| 어디서 돌릴 수 있나 | 지금은 API. 가중치는 예정 상태, 대형은 자체 운영 난이도 높음 |
| 무엇에 묶이나 | 라이선스 미공개. 중국 클라우드 경유 시 데이터 이전 검토 필요 |
| 무엇을 대체하나 | 대량 반복 처리 구간. 최고 난도 작업은 아직 아님 |

다음은 실습거리다. 지금 상태에서도 확인 가능한 범위가 있다.

같은 과제를 두 모델에 같은 프롬프트로 주고 결과를 나란히 두는 것이 시작점이다. 표 정리·문서 요약처럼 우리가 실제로 반복하는 작업으로 잡으면 판단이 빨라진다.

비교 기준은 정확도만이 아니다. *같은 품질을 얼마의 비용으로 내는가*가 실무의 기준이다.

다음에 확인할 지점도 정해 둘 만하다. 가중치와 라이선스가 실제로 게시되는지, 그리고 독립 벤치마크 결과가 자체 공개 수치와 얼마나 벌어지는지다.

> **시사점 —** 비개발자에게 이 소식의 의미는 "새 모델이 나왔다"가 아니다.
>
> 같은 일을 시키는 값이 내려간다는 뜻이고, 값이 내려가면 *지금까지 사람이 하던 반복 작업 중 자동화 후보로 넘어가는 범위*가 넓어진다. 도구 이름보다 이 경계선이 어디까지 왔는지를 보는 편이 낫다.

::: 수치
2.4조 | Qwen3.8-Max 총 파라미터 (활성 950억) | Alibaba Cloud
100만 | 컨텍스트 토큰 수 | Alibaba Cloud
$2 / $6 | 100만 토큰당 입력/출력 단가 | Alibaba Cloud Model Studio
:::

::: 출처
Alibaba Cloud — Alibaba Unveils Qwen3.8-Max: Its Largest and Most Capable Flagship Model to Date | https://www.alibabacloud.com/en/press-room/alibaba-unveils-qwen3-8-max | 공식 발표·스펙·아레나 순위·QwenWork
VentureBeat — Qwen3.8-Max arrives with a bold claim: it outperforms GPT-5.6 Sol Max and Fable 5 on agentic computer use | https://venturebeat.com/technology/qwen3-8-max-arrives-with-a-bold-claim-it-outperforms-gpt-5-6-sol-max-and-fable-5-on-agentic-computer-use | OSWorld·Terminal-Bench·PaperBench 수치·독립 검증 유보
South China Morning Post — Alibaba's AI model Qwen3.8-Max made widely accessible ahead of open-weights release | https://www.scmp.com/tech/article/3362738/alibabas-ai-model-qwen38-max-made-widely-accessible-ahead-open-weights-release | 8/3 공개·가중치 다음 주·오픈소스 노선 복귀
Caixin Global — Alibaba Releases New Qwen Model, Consolidates AI Office Tools | https://www.caixinglobal.com/2026-08-04/alibaba-releases-new-qwen-model-consolidates-ai-office-tools-102471189.html | QwenWork 통합(QoderWork·MuleRun·Wukong)
TNGlobal — China's Alibaba launches Qwen3.8-Max AI model with 2.4T parameters, 1M token context window | https://technode.global/2026/08/04/chinas-alibaba-launches-qwen3-8-max-ai-model-with-2-4t-parameters-1m-token-context-window/ | 파라미터·컨텍스트·아레나 순위
MarkTechPost — Alibaba Qwen Releases Qwen3.8-Max: A 2.4 Trillion Parameter MoE Model | https://www.marktechpost.com/2026/08/03/alibaba-qwen-releases-qwen3-8-max/ | MoE 활성 950억·Qwen 3.5 아키텍처
Neowin — Alibaba releases Qwen3.8-Max, challenging GPT-5.6 Sol and Claude Fable 5 on AI benchmarks | https://www.neowin.net/news/alibaba-releases-qwen38-max-challenging-gpt-56-sol-and-claude-fable-5-on-ai-benchmarks/ | 벤치마크 대조
apidog — Qwen 3.8 Benchmarks: What Alibaba's Table Shows | https://apidog.com/blog/qwen-3-8-benchmarks/ | SWE-bench Pro 67.7·비교군 수치
llm-stats — Claude Fable 5 vs Qwen3.8 Max | https://llm-stats.com/models/compare/claude-fable-5-vs-qwen3.8-max | SWE-bench Pro 대조 교차 확인
apidog — Qwen 3.8 Pricing Explained | https://apidog.com/blog/qwen-3-8-pricing/ | $2/$6 단일 구간·캐시 $0.25
the-decoder — GPT-5.6 Sol nearly matches Fable 5 on aggregated benchmarks at one-third the cost | https://the-decoder.com/gpt-5-6-sol-nearly-matches-fable-5-on-aggregated-benchmarks-at-one-third-the-cost/ | GPT-5.6 Sol·Fable 5 단가
officechai — Qwen3.8-Max Ranks #4 On Frontend Code Arena, #2 On Vision Arena | https://officechai.com/ai/qwen3-8-max-ranks-4-on-frontend-code-arena-2-on-vision-arena/ | 프런트엔드 코드 아레나 1,668점·비전 2위
Yotta Labs — Qwen 3.8 Benchmarks: What's Actually Verified So Far | https://www.yottalabs.ai/post/qwen-3-8-benchmarks-what-is-verified-2026 | 자체 호스팅 난도·소형 버전 현실성
buildfastwithai — Qwen3.8 Preview: 2.4T Params, Open Weights, Release | https://www.buildfastwithai.com/blogs/qwen3-8-preview-2-4t-params-open-weights-release | 라이선스 미게시·Apache 2.0 전례
CNBC — Nvidia, Microsoft, Meta and others urge caution on open-weight AI rules | https://www.cnbc.com/2026/07/24/nvidia-microsoft-meta-open-weight-ai-models.html | 7/24 25개사 공동서한
European Commission — Transparency obligations under Article 50 of the AI Act | https://digital-strategy.ec.europa.eu/en/faqs/transparency-obligations-under-article-50-ai-act | 범용 AI 모델 조항·8/2 집행 권한
:::
