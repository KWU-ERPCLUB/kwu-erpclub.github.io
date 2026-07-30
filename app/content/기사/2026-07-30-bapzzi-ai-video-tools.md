---
title: AI 영상 도구 지형 — 생성·아바타·편집 3계층과 용도별 조합
author: bapzzi
date: 2026-07-30
시각: 16:00
source_url: https://artificialanalysis.ai/video/leaderboard/text-to-video
source_name: Artificial Analysis Video Arena
성격: 도구·프롬프트
주제: 크리에이티브·미디어
설명: 과제·발표·홍보 릴스용 AI 영상 도구 15종 — 3계층 지형, 가격, 실사용 평가, 용도별 조합
태그: [영상생성, 브루, 캡컷, Veo]
지금써먹기: true
---

::: 요약
- 2026년 7월 기준 AI 영상 도구 15종을 생성·아바타·편집 3계층으로 정리. 스터디원 요청으로 조사
- 결론은 단일 도구가 아니라 조합 — 발표 영상은 브루 중심, 홍보 숏폼은 생성 모델+캡컷, 강의형은 브루·Descript
- 전부 무료 티어로 시작 가능. 유료 전환 시 현실 구간은 월 $10~29
:::

경영학부 학생이 영상을 만드는 상황은 대체로 셋이다. 과제·발표 영상, 홍보 숏폼(릴스·쇼츠), 강의·설명 콘텐츠.

이 글은 그 세 용도 기준으로 2026년 7월 시점의 도구 지형을 정리한다. 공식 발표(가격·스펙)와 실사용 평가(유튜브·커뮤니티·리뷰)를 구분해 표기한다 — 후자는 단정이 아니라 참고다.

## 한 장 요약 — 3계층으로 보면 된다

도구 이름이 쏟아져도 층은 셋뿐이다. 자기 용도가 어느 층에 걸리는지만 알면 선택지가 줄어든다.

| 계층 | 하는 일 | 대표 도구 |
|------|---------|-----------|
| 생성 | 프롬프트 → 영상 클립(수 초~수십 초) | Veo 3.1 · Sora 2 · Runway · Kling · Hailuo · Luma · Pika |
| 아바타·발표 | 대본 → 발표자(아바타) 영상 | HeyGen · Synthesia |
| 편집·자막 | 촬영본·생성본 → 완성 영상 | 브루(Vrew) · CapCut · Descript · Opus Clip |

학생 작업의 대부분은 *편집 계층에서 끝난다*. 생성 모델은 배경·삽화 클립을 보충하는 재료 공급원에 가깝다.

## 생성 모델 — 벤치마크와 실사용은 다르다

블라인드 선호 투표(Elo¹) 기준 상위권은 Google·ByteDance·Alibaba 계열이 차지하고 있다. 다만 이 순위엔 가격·접근성이 반영되지 않는다 — 실사용 추천과는 별개 지표다.

::: 수치
1246 | Text-to-Video 아레나 1위 Gemini Omni Flash의 Elo 점수 | Artificial Analysis
50크레딧 | Veo 계열 비구독자 하루 무료 제공량 | Google
$10 | Kling Standard 월 요금 — "가성비 최고"라는 실사용 평가 다수 | eesel.ai
:::

| 도구 | 최신 | 특징 | 가격 진입점 |
|------|------|------|------------|
| Google Veo | 3.1 | 오디오 동시 생성·1080p~4K. Gemini 앱·AI Studio로 접근 | 하루 50크레딧 무료 |
| OpenAI Sora | 2 | 15~25초 클립·물리 표현 강점 평가 | $0.10/초(API) |
| Runway | Gen-4.5 | 편집 통합·타사 모델 허브화 | 무료 125크레딧, 월 $12 |
| Kling | 2.5 Turbo | 모션 컨트롤·네이티브 4K | 월 $10 (Standard) |
| Hailuo | 02~2.3 | 생성 속도·유려한 모션 평가 | 월 $9.99 |
| Luma | Ray3 | 키프레임·HDR | 무료 티어, 월 $9.99 |
| Pika | 2.5~3.0 | 이펙트 특화(Pikaffects) | 무료 80크레딧, 월 $8 |

실사용 비교에서는 *복잡한 장면 일관성은 Veo, 클립 길이는 Sora라는* 평가가 반복된다. Hailuo는 커뮤니티(r/aivideo)에서 "숨은 명작"으로 불리며 프롬프트 테스트용으로 쓰인다는 팁이 있다 — 전부 비단정 참고다.

주의할 것 둘. **Sora 2는** 소비자 앱이 2026년 4월에 종료됐고 API도 9월 종료 예정이다 — 지금 신규로 의존하기엔 리스크가 있다. **Kling은** 글로벌 공식 사이트가 조사 시점에 봇 차단으로 접속 확인이 안 됐다 — 가격 수치는 정리 사이트 기준이라 결제 전 직접 확인이 필요하다.

오픈소스는 Wan2.2(Apache 2.0)와 HunyuanVideo-1.5가 실제 구동 가능한 축이다. 다만 요구 GPU(VRAM 14GB+)가 학생 개인 장비 기준으론 부담이라, 이름만 알아둬도 충분하다. "Wan 2.5/2.6/2.7"을 내건 사이트는 유료 API 상품이지 다운로드 가능한 오픈 웨이트²가 아니라는 커뮤니티 확인이 있다.

::: 용어
Elo | 1:1 블라인드 비교 승패를 누적해 매기는 상대 순위 점수(체스 레이팅 방식)
오픈 웨이트 | 모델 파라미터 파일 자체를 내려받아 내 장비에서 실행할 수 있게 공개한 형태
:::

## 아바타와 편집 — 발표·숏폼의 실전 구간

실물 출연 없이 발표 영상을 만들 때는 아바타 도구를 쓴다. 독립 리뷰 기준 HeyGen이 표현력(9.2/10), Synthesia가 포멀함(8.2/10)에서 각각 우위라는 평가가 있다 — 팀플 발표면 HeyGen, 격식 있는 보고서형이면 Synthesia 쪽이 맞다는 구도다.

편집 계층에서는 한국 사용자 기준 구도가 뚜렷하다. *브루(Vrew)는 롱폼·설명형, 캡컷(CapCut)은 숏폼·트렌드형*이라는 비교가 한국 리뷰에서 반복된다.

- **브루** — 음성을 텍스트로 바꿔 문서 편집하듯 컷 편집. 자막 정확도가 강점이라는 평. 한국어 UI. 무료 월 200크레딧
- **캡컷** — 숏폼 템플릿·AI 툴킷. "학생을 위한 최고의 무료 옵션"이라는 커뮤니티 평(무료 워터마크 없이 내보내기 가능하다는 리뷰 — 단 AI 풀기능은 Pro $19.99/월)
- **Descript** — 텍스트 기반 편집+AI 코에디터. 인터뷰·팟캐스트형에 적합. 영문 UI
- **Opus Clip** — 롱폼 녹화본에서 하이라이트를 자동 발췌해 숏폼화. 무료 월 60분

## 그래서 우리는 — 용도별 조합 3종

스터디·학과 활동 기준으로 조합하면 이렇게 된다. 전부 무료 티어에서 시작해 필요할 때만 올리면 된다.

| 용도 | 조합 | 근거 |
|------|------|------|
| 과제·발표 영상 | 브루(편집·자막) + 필요 시 HeyGen 무료(아바타) | 발표 스크립트 기반 롱폼에 브루가 최적이라는 한국 실사용 평 |
| 홍보 숏폼·릴스 | Kling 또는 Hailuo(배경 생성) → 캡컷(마감) | 저비용 생성+템플릿 마감. 세미나 녹화본은 Opus Clip으로 발췌 |
| 강의·설명 영상 | 브루 또는 Descript + Veo 무료 크레딧(삽화) | 자막 완성도 중심 롱폼 + 하루 50크레딧 무료 삽화 보충 |

## 쓰기 전 확인 — 저작권·요금 함정

과제·비상업 발표는 대부분 무료 티어로 문제가 없다. 함정은 "학과·학회 공식 계정 게시"부터다.

- 무료 티어 상업이용 불가가 흔하다(Pika Free·Runway Free 등). 공식 계정 게시는 상업/공식 용도로 취급될 수 있어 요금표의 상업이용 항목을 개별 확인해야 한다
- 미국 저작권청은 AI 단독 생성물의 저작권 등록을 인정하지 않는 입장을 유지 중이다 — 도구가 "상업이용권"을 줘도 소유권은 회색지대라는 해석이 있다
- Veo 출력물에는 SynthID 워터마크가 강제 삽입되고, 유튜브 업로드 시 변경된 콘텐츠 라벨 고지 의무가 있다는 실무 가이드가 있다
- 학습데이터 소송(NYT v. OpenAI 등)이 진행 중이라, 스톡 영상 대체 용도의 상업 사용은 유사도 리스크를 따로 점검할 필요가 있다

::: 출처
Artificial Analysis Video Arena | https://artificialanalysis.ai/video/leaderboard/text-to-video | A — Elo 순위(2026-07 접속 확인)
Google DeepMind Veo | https://deepmind.google/models/veo/ | A — Veo 3.1 기능·접근 경로
Runway Pricing | https://runway.com/pricing | A — 요금제·크레딧
Luma Dream Machine Pricing | https://lumalabs.ai/learning-hub/dream-machine-support-pricing-information | A — 요금제
Pika Pricing | https://pika.art/pricing | A — 요금제
Wan2.2 GitHub | https://github.com/Wan-Video/Wan2.2 | A — 라이선스·사양
HunyuanVideo-1.5 GitHub | https://github.com/Tencent-Hunyuan/HunyuanVideo-1.5 | A — 파라미터·VRAM
HeyGen Pricing | https://www.heygen.com/pricing | A — 요금제
Synthesia Pricing | https://www.synthesia.io/pricing | A — 요금제
Vrew 공식·요금 개편 공지 | https://vrew.ai/pricing | A — 크레딧제 구조(2026-04 개편)
Descript Pricing | https://www.descript.com/pricing | A — 요금제
Opus Clip Pricing | https://www.opus.pro/pricing | A — 요금제
ElevenLabs Pricing | https://elevenlabs.io/pricing | A — 음성·더빙 요금
Kuaishou — Kling 2.5 Turbo 보도자료 | https://ir.kuaishou.com/news-releases/news-release-details/kling-ai-launches-25-turbo-video-model-industry-leading | A — 출시 사실(본문 재확인 권장)
eesel.ai — Kling 가격 정리 | https://www.eesel.ai/blog/kling-ai-pricing | B — Kling 요금(공식 접속 차단으로 대체, 결제 전 재확인)
G2 Learn — Synthesia vs HeyGen | https://learn.g2.com/synthesia-vs-heygen | B — 아바타 품질 비교 평가
Tom's Guide — Sora 2 vs Veo 3.1 실측 | https://www.tomsguide.com/ai/ai-image-video/sora-2-vs-veo-3-1-i-tested-both-ai-video-generators-with-7-audio-prompts-heres-the-winner | B — 오디오 프롬프트 비교
fixframe — AI 영상편집 툴 비교 | https://fixframe.co.kr/ai-video-editing-tools-comparison-2026/ | B — 브루·캡컷 한국 실사용 구도
dropshot — 브루 vs 캡컷 후기 | https://match.dropshot.io/blog/나에게-맞는-무료-영상-편집-툴은-브루-vs-캡컷-비교-후기-10261 | B — 편집 도구 장단점
apiyi — Sora 2 정책 변경 정리 | https://help.apiyi.com/en/openai-sora-2-policy-change-plus-pro-only-en.html | B — 서비스 종료 일정(공식 페이지 봇 차단으로 대체)
sustainabletechpartner — AI 저작권 소송 타임라인 | https://sustainabletechpartner.com/topics/ai/generative-ai-lawsuit-timeline/ | B — 소송 현황
:::
