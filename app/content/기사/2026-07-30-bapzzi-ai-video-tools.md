---
title: AI 영상 제작 현업 파이프라인 — 단계별 표준 도구와 실제 광고 제작 사례
author: bapzzi
date: 2026-07-30
시각: 16:35
source_url: https://techcrunch.com/2026/03/26/bytedances-new-ai-video-generation-model-dreamina-seedance-2-0-comes-to-capcut/
source_name: TechCrunch · Luma · Adobe 외
성격: 도구·프롬프트
주제: 크리에이티브·미디어
설명: 상업 제작 기준 AI 영상 파이프라인 — 기획→이미지→영상 생성→편집→음성·음악 단계별 표준 도구, 코카콜라·Kalshi·삼성증권 실제 사례
태그: [영상생성, Seedance, Kling, Higgsfield, 워크플로우]
지금써먹기: true
---

::: 요약
- 현업 상업 제작 기준 AI 영상 파이프라인을 단계별로 정리 — 기획(Claude·GPT) → 스타일프레임(Midjourney·FLUX) → 영상 생성(Seedance·Kling·Higgsfield·Veo) → 편집(Premiere·Resolve) → 음성(ElevenLabs) → 음악(Suno)
- 실제 광고 3사례의 수치 포함 — 코카콜라(12개월→2개월), Kalshi NBA 광고($2,000·채택률 4~5%), 삼성증권 100% AI 광고
- 2026 상반기 구도: 중국계 모델 강세·멀티모델 허브화·"이미지→영상+후반작업이 프로 방식"이라는 컨센서스
:::

이 글은 학생 과제용이 아니라 *현업 상업 제작 기준*으로 쓴다. 어떤 도구가 어느 단계의 표준이 되고 있는지, 실제 광고는 어떤 조합으로 만들어졌는지를 본다.

버전·가격은 공식 발표 기준이고, 사용감·시장 점유 같은 업계 평가는 실사용·업계 소스 기준의 비단정 서술이다.

## 파이프라인 한 장 — 단계별 표준 구도

2026년 현재 업계에서 통용되는 서술은 대체로 이 순서다. 촬영 없이도 광고 한 편이 이 체인으로 완성된다.

| 단계 | 표준 도구 | 비고 |
|------|-----------|------|
| 기획·스크립트 | Claude · ChatGPT · Gemini | 샷리스트·대본. 대본 일관성은 Claude가 낫다는 평 |
| 스타일프레임¹ | Midjourney V8.1 · GPT Image 2 · FLUX.2 | 무드 탐색 후 가장 강한 프레임을 영상 단계로 |
| 업스케일·디테일 | Magnific(Freepik) · Topaz | AI 영상 특유의 아티팩트 보정 전용 모델도 등장 |
| 영상 생성 | Seedance · Kling · Higgsfield · Veo 3.1 · Runway · Luma | 다음 섹션 |
| 연기·립싱크 | Runway Act-Two · OmniHuman · HeyGen | 배우 연기를 캐릭터에 전이 |
| 편집·합성 | Premiere Pro · After Effects · DaVinci Resolve | 최종 마감은 여전히 전통 NLE²라는 관행 |
| 음성·더빙 | ElevenLabs | 더빙 $0.33~0.50/분 |
| 음악·효과음 | Suno · Udio · ElevenLabs SFX | 저작권 소송 변수는 마지막 섹션 |

핵심 관행 하나. 실무 사례들에서 공통으로 확인되는 패턴은 *AI 클립을 촬영 원본처럼 취급하고, 편집·색보정·합성은 전통 편집 툴에서 마감*한다는 것이다.

텍스트→영상 직행은 아마추어용이고, 이미지→영상 변환에 후반작업을 얹는 게 프로 방식이라는 인식이 커뮤니티에서 컨센서스화되고 있다는 관찰도 같은 맥락이다.

::: 용어
스타일프레임 | 영상의 룩(색·조명·구도)을 확정하기 위해 먼저 만드는 대표 정지 이미지
NLE | 비선형 편집기(Non-Linear Editor) — Premiere·Resolve 같은 전통 편집 소프트웨어
:::

## 영상 생성 — 중국계 강세와 허브화

2026년 상반기 지형의 두 축은 **중국계 모델의 물량 장악**과 **멀티모델 허브화**다.

::: 수치
80%+ | Seedance 2.0의 일일 컴퓨트 점유율이라는 업계 분석 — 광고·커머스 대량 생산의 사실상 표준 | RedHub
7/8 | 세계 상위 8개 영상 모델 중 중국계 수 — 서구권 상위권은 Runway 유일이라는 분석 | RedHub
$0.11 | Kling 3.0 Turbo 720p 초당 단가(오디오 포함, ¥0.8) | Atlas Cloud
:::

- **Seedance**(ByteDance) — 2.0이 CapCut·Dreamina에 통합돼 커머스 물량전의 표준이 됐다는 분석. 2.5는 30초 생성·레퍼런스 50개 입력으로 6월 발표(7월 공개 예정). 실제 인물 얼굴 생성 차단·비가시 워터마크 내장
- **Kling**(Kuaishou) — 3.0 Turbo(오디오 내장·립싱크)와 Omni(4K 입출력). 연환산 매출 2.4억 달러·크리에이터 6천만 명 규모로 알려져 있다. 초사실적 인물·모션의 선두라는 평
- **Higgsfield** — 단일 모델이 아니라 *15개 이상 모델을 한 구독으로 묶은 허브*다($9/월부터). 카메라 디렉팅(Cinema Studio)·캐릭터 일관성(Soul ID)·광고 자동 변형(Marketing Studio) 등 광고 제작 특화 레이어가 채택 이유로 꼽힌다
- **Veo 3.1**(Google) — 레퍼런스 3장으로 캐릭터·제품 정체성 유지, 48kHz 오디오 내장. Lite $0.15/초~
- **Runway Gen-4.5** — 블라인드 벤치마크(Artificial Analysis) 1위를 기록했다는 발표. 서구권의 대표 주자
- **Luma Ray3.2** — 클립당 키프레임 16개로 프레임 단위 제어, 16비트 EXR — 스튜디오·에이전시 겨냥

가격 구도가 채택을 좌우한다. 중국계 모델의 초당 단가는 **$0.018~0.153** 수준으로 서구 모델 대비 10~30배 저렴하다는 분석이 있다 — 품질 경쟁 못지않게 *물량·속도·단가가 상업 채택의 변수*가 된 구도다.

## 이미지·업스케일·음성·음악 — 앞뒤 단계

영상 생성 앞뒤의 단계들도 2026년 상반기에 세대가 바뀌었다.

- **Midjourney V8.1**(4월) — 렌더링 4~5배 고속화. 정지 이미지를 5초×4클립으로 움직이는 V1 Video 내장
- **GPT Image 2**(4월) — 이미지 모델 최초로 추론(reasoning) 탑재: 생성 전 구도·개수·제약을 검증. 최대 2000px·다국어 텍스트 렌더링. DALL-E 2·3은 5월 종료
- **FLUX.2**(Black Forest Labs) — 참조 이미지 10장으로 캐릭터·스타일 일관성. 경량 오픈소스 klein(Apache 2.0)도 출시
- **Magnific** — 4월부로 Freepik이 Magnific으로 리브랜딩, 독립 구독($39~299) 폐지 후 통합 요금제(월 $5.75~)에 번들. 업스케일 표준 지위
- **Topaz** — Astra 2가 *AI 생성 영상 특유의 아티팩트 보정 전용*으로 나옴. 로컬 구동 강화(VRAM 최대 95% 절감)
- **ElevenLabs** — TTS $0.05~0.10/1,000자·더빙 $0.33~0.50/분·효과음 $0.12/분. 원 화자 음색 유지 더빙이 현지화 표준
- **Suno·Udio** — 다음 섹션의 소송 변수와 함께 볼 것

## 실제 제작 사례 — 수치로 본 현업

**사례 1 — 코카콜라 홀리데이 캠페인.** AI 스튜디오 3곳(Secret Level·Silverside·Wild Card)에 맡겨 Leonardo·Luma·Runway·Kling 조합으로 제작. 전통 12개월+ 일정이 **2개월로** 단축됐고, 1만 프레임·5천 세그먼트를 40여 명이 원격 협업으로 처리했다.

다만 2025년판은 여론 역풍을 맞았다 — 감성 분석 기준 긍정 반응이 **23.8%에서 10.2%로** 급락했다는 조사가 있다. 비용 절감과 브랜드 수용성은 별개 문제라는 사례다.

**사례 2 — Kalshi NBA 파이널 광고.** 15년 경력 감독 1인이 **2~3일, $2,000으로** 완성해 전통 대비 약 95% 절감이라는 보도. 워크플로우 = Gemini 샷리스트(한 번에 5프롬프트 제한) → Veo 3 생성 → Premiere·CapCut 마감.

핵심 수치는 채택률이다. **300~400회** 생성 시도에서 채택 클립은 **15개** — 4~5%다. 감독 본인은 "저렴하다고 아무나 만드는 게 아니다"라며 연출·코미디 작법이 방어 가능한 스킬이라고 강조했다.

**사례 3 — 삼성증권 mPOP 광고(한국).** 배우·촬영 없이 100% 생성형 AI로 제작, 음악까지 AI 작곡. 예고편+본편 300만 회 조회라는 보도. 세부 사용 모델은 비공개다.

**참고 — 개인 크리에이터 18개월 회고.** 사용 가능 클립 1,200개 중 80% 폐기·240개만 채택, 총 투자 $15,000. 교훈으로 "텍스트→영상은 클라이언트 작업에 너무 랜덤 — 반드시 이미지→영상으로", "씬을 통으로 만들지 말고 4초 단위 모듈로"가 제시된다.

## 흐름 읽기 — 그래서 무엇을 보나

미디어·제작 지망이라면 진입로가 명확해졌다. Higgsfield류 허브 하나($9/월~)로 주요 모델을 전부 체험할 수 있고, 위 사례들의 채택률 수치가 실무 감각의 기준선이 된다 — *생성은 싸고, 선별과 연출이 실력*이라는 구도다.

경영·마케팅 관점의 변수는 셋이다.

- **비용 구조 붕괴**: 제작비 95% 절감 사례가 방송 광고까지 올라왔다 — 외주·대행 시장의 가격 재편 신호
- **브랜드 리스크**: 코카콜라 역풍처럼 절감과 수용성이 따로 간다. AI 표기 여부가 브랜드 의사결정 변수가 됨
- **법적 변수**: Suno·Udio 저작권 소송에서 Warner·UMG는 화해(라이선싱 전환), UMG·Sony 대 Suno 건은 7월 판결을 앞두고 있다는 보도 — 결과에 따라 AI 음악의 라이선스 의무화 여부가 갈린다. 한국은 AI 광고 표기 법제가 없는 규제 공백 상태라는 지적도 있다

::: 출처
TechCrunch — Seedance 2.0 CapCut 통합 | https://techcrunch.com/2026/03/26/bytedances-new-ai-video-generation-model-dreamina-seedance-2-0-comes-to-capcut/ | A — 출시·기능
Atlas Cloud — Kling 3.0 Turbo·Omni | https://www.atlascloud.ai/blog/guides/kling-3.0-turbo-kling-omni | A/B — 스펙·가격
Higgsfield 공식 블로그 | https://higgsfield.ai/blog/best-all-in-one-subscription-ai-images-video | A — 허브 구성·요금
Luma — Ray3.2 발표 | https://lumalabs.ai/news/introducing-ray-3-2 | A — 키프레임·타깃
eWeek — Runway Gen-4.5 | https://www.eweek.com/news/runway-ai-video-model/ | A — 발표·벤치마크
Black Forest Labs — FLUX.2 | https://bfl.ai/blog/flux-2 | A — 공식 발표
Neurohive — GPT Image 2 정리 | https://neurohive.io/en/news/chatgpt-images-2-0-openai-launches-image-generation-model-with-reasoning-2k-resolution-and-multilingual-text/ | A/B — 추론·해상도(OpenAI 원문 봇 차단으로 대체)
Topaz Labs — 2026-04 릴리스 | https://www.topazlabs.com/news/the-next-gen-release---april-2026 | A — Astra 2·로컬 구동
ElevenLabs — API 가격 | https://elevenlabs.io/pricing/api | A — TTS·더빙·SFX 단가
Adobe — Premiere/AE 25.2 발표 | https://blog.adobe.com/en/publish/2025/04/02/introducing-new-ai-powered-features-workflow-enhancements-premiere-pro-after-effects | A — Generative Extend 등
PetaPixel — DaVinci Resolve 21 | https://petapixel.com/2026/06/03/davinci-resolve-21-officially-released-with-new-photo-editing-ai-tools-and-much-more/ | B — AI 툴 8종
BytePlus — OmniHuman-1 | https://www.byteplus.com/en/blog/omnihuman-1 | A — 멀티모달 입력·용도
ImagineArt — Runway Act-Two | https://www.imagine.art/blogs/runway-act-two-overview | B — 퍼포먼스 전이(공식 헬프 봇 차단으로 대체)
HeyGen — 광고용 사례 | https://www.heygen.com/blog/best-ai-video-generator-for-ads | B — Trivago 현지화
Silverside AI — 코카콜라 프로젝트 | https://www.silverside.ai/projects/coca-cola | A — 일정·규모
Forbes — 코카콜라 2025 역풍 | https://www.forbes.com/sites/danidiplacido/2025/11/04/coca-cola-sparks-backlash-with-ai-generated-christmas-ad-again/ | B — 감성 지수
MarkTechPost — Kalshi NBA 광고 | https://www.marktechpost.com/2025/06/14/ai-generated-ad-created-with-googles-veo3-airs-during-nba-finals-slashing-production-costs-by-95/ | A/B — 비용·방영
The Daring Creatives — PJ Ace 워크플로우 | https://www.thedaringcreatives.com/pj-ace-made-an-nba-finals-ad-for-2-000-and-published-the-prompts/ | B — 채택률·프롬프트 공개
한국경제 — 삼성증권 100% AI 광고 | https://www.hankyung.com/article/2025100196871 | B — 사례·조회수
Clixie — 18개월 1,200클립 회고 | https://www.clixie.ai/blog/my-2026-ai-video-journey-1-200-clips-15k-spent-and-what-actually-works | B — 채택률·교훈
RedHub — 중국계 모델 시장 분석 | https://blog.redhub.ai/chinese-ai-video-models/ | B — 점유율·단가 분석
MusicBusinessWorldwide — UMG·Udio 합의 | https://www.musicbusinessworldwide.com/universal-music-settles-udio-lawsuit-strikes-deal-for-licensed-ai-music-platform/ | A — 라이선싱 전환
StudioBinder — AI 필름메이킹 가이드 | https://www.studiobinder.com/blog/ai-filmmaking-tools/ | B — 파이프라인 관행
OpenAds — 국내 AI 광고 규제 공백 | https://openads.co.kr/content/contentDetail?contsId=17394 | B — 한국 규제 지적
:::
