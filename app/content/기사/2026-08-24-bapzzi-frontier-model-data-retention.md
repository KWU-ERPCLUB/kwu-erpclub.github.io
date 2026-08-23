---
title: 안전 감시가 로그를 요구한다 — 오픈AI·앤트로픽이 갈라선 데이터 보존
author: bapzzi
date: 2026-08-24
시각: 05:20
source_url: https://www.axios.com/2026/08/19/openai-previews-zero-retention-safety-system-as-anthropic-requires-data-logs
source_name: Axios · OpenAI · Bloomberg
성격: 심층 분석
주제: 거버넌스·리스크
설명: 8월 19일 오픈AI가 프런티어 모델의 데이터 무보존(ZDR) 유지를 발표했고, 다음 날 블룸버그는 앤트로픽이 30일 보존 데이터를 고객 클라우드로 옮기는 방안을 준비 중이라고 보도했다. 에이전트가 길어지면서 안전 감시와 무보존 약속이 정면으로 부딪힌 결과다
태그: [오픈AI, 앤트로픽, 데이터보존, 엔터프라이즈, 프라이버시]
---

::: 요약
- 8월 19일 오픈AI가 프런티어 모델에 **데이터 무보존(ZDR)을** 계속 제공한다고 발표하고, 「프라이빗 세이프티 프로세싱」을 프리뷰로 공개했다. 정식 롤아웃과 기술 백서는 **9월** 예정이다.
- 앤트로픽은 반대 방향이었다. **2026년 6월 9일부터** 최상위 모델(대상 모델)에 **30일 보존을** 의무화하고 그 모델들에는 무보존을 제공하지 않는다.
- 8월 20일 블룸버그는 앤트로픽이 30일 보존은 유지하되 저장 위치를 **고객 자체 클라우드로** 옮기는 방식을 준비 중이라고 보도했다. 규제 산업 고객 **100곳 이상과** 함께 설계했고 목표 시점은 올가을이다.
- 충돌 지점은 하나다. *에이전트 작업이 여러 요청·여러 세션에 걸치면서, 안전 감시가 단발 요청 검사로는 성립하지 않게 됐다.*
:::

## 무슨 일이 있었나

8월 19일, 오픈AI가 프런티어 모델¹에 **데이터 무보존²**(Zero Data Retention, 이하 ZDR)을 계속 제공하겠다고 밝혔다([OpenAI](https://openai.com/index/offering-zero-data-retention-for-frontier-models/)).

같이 공개한 것이 「프라이빗 세이프티 프로세싱」(Private Safety Processing)이다. 여러 요청에 걸친 오남용 패턴을 찾되, 프롬프트와 응답 자체는 오픈AI에 노출하지 않고 **좁게 정의된 안전 신호만** 회사로 보내는 구조라고 설명했다([Axios](https://www.axios.com/2026/08/19/openai-previews-zero-retention-safety-system-as-anthropic-requires-data-logs)).

고객 데이터는 고객이 관리하는 인프라에 두거나, 오픈AI가 저장하되 암호화 키를 고객이 쥐는 형태를 택할 수 있다(같은 보도). 현재는 프리뷰 단계이고, 정식 롤아웃과 기술 백서는 9월로 예고됐다.

초기 테스트에 이름이 오른 곳은 데이터브릭스·마이크로소프트·애브리지 등이다([The Next Web](https://thenextweb.com/news/openai-zero-data-retention-private-safety-processing)).

바로 다음 날인 8월 20일, 블룸버그는 앤트로픽이 데이터 보존 정책을 손본다고 보도했다. 30일 보존 자체는 유지하되, 그 데이터를 앤트로픽 서버가 아니라 **기업 고객 자체 클라우드에** 두는 선택지를 올가을 목표로 준비 중이라는 내용이다([Bloomberg](https://www.bloomberg.com/news/articles/2026-08-20/anthropic-plans-to-change-data-retention-policy-for-advanced-ai)).

이틀 사이 두 회사가 같은 문제에 서로 다른 답을 내놓은 셈이다.

::: 수치
30일 | 앤트로픽 대상 모델의 의무 보존 기간 | Anthropic 헬프센터
6월 9일 | 대상 모델 보존 정책 시행일 (2026년) | Anthropic 헬프센터
100곳+ | 앤트로픽이 새 방식을 함께 설계한 규제 산업 고객 수 | Bloomberg (8/20)
9월 | 오픈AI 프라이빗 세이프티 프로세싱 롤아웃·기술 백서 예정 | OpenAI (8/19)
:::

::: 용어
프런티어 모델 | 각 회사가 그 시점에 보유한 최상위 성능 모델. 위험 평가·안전 절차가 가장 무겁게 걸린다
ZDR(데이터 무보존) | 요청 처리 후 프롬프트·응답을 남기지 않는다는 계약 조건. 주로 API·엔터프라이즈 계약에 붙는다
:::

## 무보존이라는 말은 세 층으로 나뉜다

"데이터를 안 쓴다"는 말은 실제로는 세 가지 다른 약속이 뭉쳐 있는 표현이다. 계약서를 읽을 때 이 셋을 나눠야 한다.

**첫째, 학습 사용 여부.** 내 입력이 모델을 다시 훈련하는 데 쓰이는가. 오픈AI는 기업 고객 데이터를 명시적 동의 없이는 학습에 쓰지 않는다고 밝힌다([OpenAI](https://openai.com/index/offering-zero-data-retention-for-frontier-models/)).

**둘째, 보존 기간.** 학습에 안 쓰더라도 로그로 남길 수 있다. ZDR은 이 칸을 0으로 만드는 조건이다.

**셋째, 사람 검토 여부.** 남은 데이터를 회사 직원이 열어 볼 수 있는가. 오픈AI의 ZDR 설명은 직원 검토 대상이 아니라는 점을 별도로 명시한다(같은 발표).

세 칸이 따로 노는 사례가 이번 앤트로픽 정책이다. 앤트로픽은 대상 모델의 프롬프트·출력을 30일간 보존한다고 문서에 적어 두면서, 그 데이터의 용도를 안전 작업으로 한정한다고 밝힌다([Anthropic 헬프센터](https://support.claude.com/en/articles/15425996-data-retention-practices-for-covered-models)).

학습에는 안 쓰지만 보존은 한다 — 둘째 칸만 켜진 상태다.

*"우리는 고객 데이터로 학습하지 않는다"는 문장은 보존 기간에 대해 아무것도 말해 주지 않는다.*

## 왜 지금 충돌했나

원인은 모델 성능이 아니라 **작업의 길이다**.

챗봇 시절의 오남용 감시는 요청 한 건을 보면 됐다. 위험한 프롬프트 하나를 걸러 내는 문제였다.

에이전트는 다르다. 하나의 작업이 수십 번의 요청과 여러 세션에 걸쳐 진행되므로, 각 요청은 무해해 보이는데 묶어 놓으면 공격이 되는 형태가 가능해진다.

앤트로픽이 30일 창을 든 근거로 든 것이 그 예다. **Best-of-N 탈옥¹** — 조금씩 바꾼 프롬프트 수백 개를 던져 그중 하나가 안전장치를 통과하기를 노리는 방식이다. 요청 한 건만 보면 잡히지 않고, 여러 요청을 겹쳐 봐야 패턴이 드러난다([Axios](https://www.axios.com/2026/08/19/openai-previews-zero-retention-safety-system-as-anthropic-requires-data-logs)).

여기서 두 요구가 정면으로 부딪힌다. 안전 감시는 여러 요청을 이어 봐야 하고, 그러려면 로그가 남아야 한다. 반대로 금융·의료·법무 같은 규제 산업 고객은 로그가 남지 않는다는 조건 때문에 계약을 맺은 쪽이다.

앤트로픽 스스로 이 갈등을 문서에 적었다. 8월 리스크 리포트에서 보존 정책이 "무보존을 기대해 온 고객들에게 인기가 없을 것"이라고 인정했다([The Register](https://www.theregister.com/ai-and-ml/2026/08/20/openai-chases-anthropics-biz-customers-with-zero-data-retention-pledge/5290609)).

::: 용어
Best-of-N 탈옥 | 같은 요청을 조금씩 변형해 여러 번 보내, 그중 하나가 안전 필터를 통과하기를 노리는 공격 방식
:::

## 두 해법의 모양이 다르다

같은 제약 아래 나온 두 답을 나란히 놓으면 차이가 분명해진다.

| 축 | 오픈AI | 앤트로픽 |
|---|---|---|
| 발표·보도 시점 | 2026-08-19 (공식 발표) | 2026-06-09 시행 → 08-20 변경 보도 |
| 최상위 모델의 보존 | 무보존 유지 | 30일 의무 보존 |
| 감시 방식 | 좁은 안전 신호만 추출 | 보존된 로그를 안전 팀이 분석 |
| 데이터가 놓이는 곳 | 고객 인프라 또는 고객 관리 키로 암호화 | (현행) 앤트로픽 서버 → (예정) 고객 클라우드 |
| 현재 상태 | 프리뷰 — 9월 롤아웃·백서 예정 | 시행 중 — 변경안은 올가을 목표 |
| 검증 가능성 | 기술 백서 공개 전까지 외부 검증 불가 | 정책 문서로 조건이 이미 공개돼 있음 |

표의 마지막 두 줄이 실무에서 갈리는 지점이다.

앤트로픽 쪽은 조건이 불리하지만 이미 문서로 확정돼 있어 계약 검토가 가능하다. 오픈AI 쪽은 조건이 유리하지만 아직 프리뷰이고, "좁게 정의된 안전 신호"가 구체적으로 무엇인지는 9월 백서가 나와야 판단할 수 있다.

두 회사의 방향이 결국 한 지점으로 수렴하는 부분도 있다. **데이터가 물리적으로 어디에 놓이느냐를 고객이 정하게 하는 것** — 오픈AI는 고객 관리 암호화 키로, 앤트로픽은 고객 자체 클라우드 보존으로 같은 칸을 건드린다.

클라우드 업계가 십수 년에 걸쳐 밟은 경로와 모양이 같다. 서비스는 벤더가 돌리되 키와 저장 위치는 고객이 쥐는 구조다.

## 소송 기록이 만든 전례

이 논쟁에는 앞선 사례가 있다.

2025년 뉴욕타임스와의 저작권 소송에서 법원이 오픈AI에 출력 로그 보존을 명령했을 때, 오픈AI는 ZDR API 계약 고객은 해당 명령의 영향을 받지 않는다고 밝혔다([OpenAI](https://openai.com/index/response-to-nyt-data-demands/)).

ZDR이 마케팅 문구가 아니라 법적 노출을 실제로 가르는 선이었다는 뜻이다. 저장하지 않은 데이터는 제출 명령의 대상이 되지 않는다.

기업이 ZDR 조항에 값을 매기는 이유가 여기 있다. 프라이버시 취향의 문제가 아니라, 소송·수사·규제 조사에서 무엇이 꺼내질 수 있는지의 문제다.

*그래서 보존 기간은 보안 항목이 아니라 계약·법무 항목으로 다뤄진다.*

## SO WHAT

**닿는 경로·시차.** 이 이슈가 학부생 현실에 닿는 지점은 도구 사용법이 아니라 문서 검토다. 인턴·신입으로 AI 도구 도입 검토안을 만들거나 벤더 계약서의 데이터 처리 조항을 읽는 자리에 앉을 때 처음 마주친다.

국내는 시차가 한 겹 더 있다. 금융권은 2026년 4월 20일 전자금융감독규정 시행세칙 개정이 시행되면서 일정 보안 요건을 지키면 내부 업무망에서 SaaS를 쓸 수 있게 됐지만, 이는 SaaS 이용에 대한 예외다([신&김 뉴스레터](https://www.shinkim.com/kor/media/newsletter/3105)). 생성형 AI 서비스에 대해서는 금융당국이 금융권과 협의해 별도로 추진하겠다고 밝힌 단계다([ZDNet Korea](https://zdnet.co.kr/view/?no=20260420161504)).

공공 부문은 CSAP 인증, 해외 모델 호출은 개인정보 국외이전 고지 절차가 따로 걸린다. 해외 벤더가 이번 주에 내놓은 조건이 국내 기업 계약서에 그대로 옮겨 적히기까지는 그만큼 시간이 더 든다.

**지금 해당 없는 것.** ZDR·30일 보존은 API와 엔터프라이즈 계약에 붙는 조항이다. 학생이 쓰는 무료·개인 구독 요금제는 애초에 ZDR 대상이 아니므로, 이번 발표로 개인 계정의 데이터 처리 방식이 바뀌는 것은 없다.

프라이빗 세이프티 프로세싱도 아직 프리뷰다. 9월 기술 백서 전까지는 "안전 신호만 보낸다"는 설명을 외부에서 검증할 방법이 없으므로, 확정된 사실로 옮겨 쓰지 않는 편이 맞다.

이 소식을 프라이버시·거버넌스 직무 수요 증가로 연결하는 이야기도 이번 발표에는 근거가 없다. 두 회사 모두 인력 계획은 밝히지 않았다.

**지금 할 수 있는 것.**

- 본인이 쓰는 AI 도구 3종의 데이터 처리 문서를 열어 4칸 표로 정리한다 — 학습 사용 여부 · 보존 기간 · 사람 검토 여부 · 옵트아웃 경로. 위 세 층 구분을 그대로 칸으로 쓴다. 비용 0원.
- 앤트로픽 대상 모델 정책 문서를 원문으로 읽고, 어떤 모델이 무보존에서 제외되는지 확인한다([Anthropic 헬프센터](https://support.claude.com/en/articles/15425695-covered-models)). 벤더 정책 문서를 직접 읽는 연습 자체가 목적이다. 비용 0원.
- 팀 프로젝트에서 외부 자료를 AI에 붙여넣기 전 규칙을 한 장으로 만든다 — 넣어도 되는 것 / 익명화 후 넣을 것 / 넣지 않을 것 3칸. 비용 0원.
- 9월에 공개될 오픈AI 기술 백서를 읽고, "좁게 정의된 안전 신호"가 실제로 무엇을 전송하는지 한 문단으로 정리한다.

::: 출처
Axios — OpenAI previews zero-retention safety system as Anthropic requires data logs (2026-08-19) | https://www.axios.com/2026/08/19/openai-previews-zero-retention-safety-system-as-anthropic-requires-data-logs | 안전 신호 추출 방식·고객 관리 키·Best-of-N 탈옥·앤트로픽 30일 대조
OpenAI — Offering Zero Data Retention for frontier models (2026-08-19) | https://openai.com/index/offering-zero-data-retention-for-frontier-models/ | ZDR 정의·학습 미사용·직원 검토 제외·9월 롤아웃 예고
Bloomberg — Anthropic Plans to Change Data Retention Policy for Advanced AI (2026-08-20) | https://www.bloomberg.com/news/articles/2026-08-20/anthropic-plans-to-change-data-retention-policy-for-advanced-ai | 고객 클라우드 보존 방식·규제 산업 고객 100곳 이상·올가을 목표
Anthropic 헬프센터 — Data retention practices for Covered Models | https://support.claude.com/en/articles/15425996-data-retention-practices-for-covered-models | 30일 보존·2026-06-09 시행·안전 작업 한정 용도
Anthropic 헬프센터 — Covered Models | https://support.claude.com/en/articles/15425695-covered-models | 대상 모델 지정 범위·무보존 미제공
The Register — OpenAI chases Anthropic's biz customers with zero data retention pledge (2026-08-20) | https://www.theregister.com/ai-and-ml/2026/08/20/openai-chases-anthropics-biz-customers-with-zero-data-retention-pledge/5290609 | 앤트로픽 8월 리스크 리포트의 "인기 없을 것" 인정
The Next Web — OpenAI previews Private Safety Processing to keep zero data retention | https://thenextweb.com/news/openai-zero-data-retention-private-safety-processing | 초기 테스트 참여 기업(데이터브릭스·마이크로소프트·애브리지)
OpenAI — How we're responding to The New York Times' data demands (2025) | https://openai.com/index/response-to-nyt-data-demands/ | 법원 로그 보존 명령에서 ZDR API 고객 제외
신&김 — 금융회사 SaaS 이용 관련 망분리 규제 개선의 주요 내용과 시사점 | https://www.shinkim.com/kor/media/newsletter/3105 | 전자금융감독규정 시행세칙 개정(2026-04-20 시행) 해설
ZDNet Korea — 금융권 AI 도입 막던 망분리 규제 완화 (2026-04-20) | https://zdnet.co.kr/view/?no=20260420161504 | 생성형 AI는 향후 별도 추진이라는 금융당국 입장
:::
