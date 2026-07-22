# ERP연구회 사이트 (site)

## 목적
광운대학교 ERP연구회 **통합 허브**. 역할 3차 개정(2026-07-11 owner): **메인(/)=소개 간판(외부 방문자용)** /
**세부 페이지=내부자 활용 중심** — 스터디 운영 이력·로드맵·성과 기록 아카이브(위키·운영기록형).
진도·성과 수치 대시보드는 아님(그건 adsp-board 등 각 스터디 앱 담당). 이 사이트 자체가 스터디 방식(AI 협업 · git · 무료 배포)의 증거물.

## 현재상태 (2026-07-23 — P1 구현 완료, 로컬 검증분 충족)
- **P1 구현 완료** — C1~C5 중 **로컬 검증분(C2·C4·C5 + C3 로컬) 충족**, push·원격 실증(C1·C3 원격)은 대기(오너 게이트). 단일원천 = `SPEC.md`(이 폴더).
- **지금 존재하는 것**:
  - **콘텐츠 데이터 계약 + CI 게이트** — 기사/세미나/실습 frontmatter 규칙을 `app/src/content/schema.js` 하나로 검증(`npm run validate`), CI가 validate+test(18개)+build를 통과해야 배포. 비오너 push는 `app/content`·`app/members`만 허용(경로 가드).
  - **멤버 개인 페이지 자동 엔트리** — `app/members/<id>/index.html` 폴더만 추가하면 독립 빌드 페이지 생성(공용 CSS import 금지 = 격리). 오너 시드 `members/bapzzi` 존재.
  - **신규 6페이지** — 메인(현황판: 트랙 카드·요약·최근 기고)·기사·세미나·실습·멤버 목록·멤버 개인.
  - **기존 5페이지 유지** — about·join·log·reports·projects.
- 소스 = KWU-ERPCLUB/kwu-erpclub.github.io 공개 repo(이 폴더 자체가 중첩 독립 repo). 멤버 쓰기 = collaborator 등록(P2 온보딩).
- **현행 라이브: https://kwu-erpclub.github.io/** — push 전까지 기존 사이트 유지. 구 SPEC(이원 구조)·hub-spec은 새 SPEC이 대체.

## 다음 할 일 (새 세션 재개 지점)
- [ ] **① push + 원격 실증**(C1·C3 원격 — 오너 게이트): main push → Actions 성공 + https://kwu-erpclub.github.io/ 200(C1) · 위반 콘텐츠 브랜치로 CI FAIL 실증(C3 원격).
- [ ] **② P2**(C6~C8): 콘텐츠 템플릿 3종·개인 페이지 템플릿·온보딩 가이드·세미나 6회 골격·산업 현황 수치 탑재. **+경화 2건(최종 리뷰 이월)**: ⑴Markdown 링크 `javascript:` 스킴 무해화 ⑵validate가 `members/*/profile.json`(§7 스키마)도 검사(+MembersPage id 방어).
- [ ] **③ P3**(C9): 기존 디자인 토큰 정합 + 3뷰포트 + 오너 육안.
