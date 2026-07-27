---
title: 질문에서 위임으로 — AI 활용 구조 3단
author: bapzzi
date: 2026-07-25
회차: 1
유형: 인지
주제: 에이전트
일정미정: true
슬라이드: https://kwu-erpclub.github.io/slides/s1/
썸네일: [/slides/s1/thumb-1.png, /slides/s1/thumb-2.png]
요점: [챗과 에이전트의 차이 = 실행 범위와 완료 조건, Prompt → Context → Harness — 활용 구조 3단, 환각은 구조의 귀결 — 검증이 기본기, 위임에는 완료 조건과 독립 검증]
---

AI 활용 방식을 3단(질문·맥락·환경)으로 구분하고, 챗 사용에서 에이전트 위임으로 넘어가는 구조를 다루는 인지 세미나. 발표자료 45장 = 목록의 슬라이드 카드.

## 다루는 내용

- 어디까지 써봤나 — CHAT → COPILOT → AGENT → WORKFLOW 자가진단
- 사례 — 시험장을 탈출한 AI(OpenAI 공시 사건)
- LLM 기초 — 다음 토큰 예측 · 환각의 구조적 원인 · 용어 10
- MIS 계보의 다음 칸 — TPS → MIS → DSS → BI, 그리고 AI
- 1단계 Prompt — 작업 지시문 5요소·좋은 질문
- 2단계 Context — 컨텍스트 윈도·RAG·선별
- 3단계 Harness — 도구·MCP·런타임·가드레일
- 위임의 실제 — 에이전트 루프 · 실사례 2건(사이트 제작 로그·기고 파이프라인)
- 데이터로 보는 현재 — 되는 것(벤치마크 추이)·안 되는 것(실패 모드)
- 결국 사람 — 문제 정의 · 맥락 제공 · 검증

## 출처

- [OpenAI — Why Language Models Hallucinate (2025)](https://openai.com/index/why-language-models-hallucinate/)
- [Anthropic — Reduce hallucinations](https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-hallucinations)
- [Anthropic — Building effective agents](https://www.anthropic.com/engineering/building-effective-agents)
- [Model Context Protocol 공식 문서](https://modelcontextprotocol.io/docs/getting-started/intro)
- [Lewis et al. — Retrieval-Augmented Generation (NeurIPS 2020)](https://arxiv.org/abs/2005.11401)
- [Liu et al. — Lost in the Middle (2023)](https://arxiv.org/abs/2307.03172)
- [OSWorld 벤치마크·리더보드](https://arxiv.org/abs/2404.07972)
- [SWE-bench Verified 리더보드](https://www.swebench.com/)
- [METR — Time Horizon 1.1 (2026)](https://metr.org/blog/2026-1-29-time-horizon-1-1/)
- [Laban et al. — LLMs Get Lost in Multi-Turn Conversation (2025)](https://arxiv.org/abs/2505.06120)
- [한국은행 이슈노트 2025-22 — AI의 빠른 확산과 생산성 효과](https://www.bok.or.kr/portal/bbs/P0002353/view.do?nttId=10093071&menuNo=200433)
- [OWASP — Top 10 for LLM Applications](https://owasp.org/www-project-top-10-for-large-language-model-applications/) · [NIST AI RMF](https://www.nist.gov/itl/ai-risk-management-framework)

수치·순위는 2026-07-25 확인 기준. 벤치마크 상위 점수는 각 팀 자체 보고 성격 — 방향성 참고.
