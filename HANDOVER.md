# HANDOVER — 이양 문서

> 독자 = 이 사이트·AIM 운영을 넘겨받는 차기 운영진.
> 목적 = **이 repo 하나를 받으면 운영에 필요한 지식 전부에 닿는** 상태를 만든다.
> 일상 운영 방법 = `RUNBOOK.md`(이 문서는 "무엇을 넘겨받아야 하는가"만 담는다).

목차

1. 필독 순서
2. 넘겨받을 계정·권한 인벤토리
3. 승계되지 않는 것 (과 그 대체물)
4. 연간 운영 사이클
5. 이양 체크리스트
6. 재해 복구

---

## 1. 필독 순서

1. `README.md` — 이 사이트가 무엇인지
2. `RUNBOOK.md` — 일상 운영 방법
3. 이 문서 — 넘겨받을 것 목록
4. `CONTRIBUTING.md` — 기사·콘텐츠 규격
5. `supabase/README.md` — 데이터(DB) 운영
6. `ops/` — 정기 발행 절차(AI 프롬프트 겸 사람 절차)

설계 배경 문서(운영 헌장·스터디 운영틀·릴리스 체계 설계)는 창립 오너의 작업공간에 있다 — 이양 시 사본으로 함께 전달받는다(§5 체크리스트).

## 2. 넘겨받을 계정·권한 인벤토리

### GitHub

| 항목 | 값 | 이양 방법 |
|---|---|---|
| 조직 | `KWU-ERPCLUB` | Settings > People에서 후임을 Owner로 승격 |
| repo | `kwu-erpclub.github.io` (GitHub Pages 배포) | 조직 소유라 조직 이양으로 따라온다 |
| 브랜치 룰셋 | id `19734261` (main 보호) | bypass 목록에서 전임 제거·후임 추가 |
| Claude GitHub 앱 | Integration `1236702` | 조직 Settings > GitHub Apps에서 확인. 후임이 안 쓰면 제거 가능 |
| Actions secrets | `VITE_SUPABASE_URL` · `VITE_SUPABASE_ANON_KEY` · `SUPABASE_SERVICE_KEY` | 값은 Supabase 대시보드에서 재확인 가능(`supabase/README.md` §4) |
| 운영진 코드 목록 | `.github/workflows/deploy.yml`의 `MAINTAINERS` 한 줄 + `.github/CODEOWNERS` | 두 파일에서 계정명 교체(커밋 1건) |

### Supabase (DB·로그인)

| 항목 | 값 | 이양 방법 |
|---|---|---|
| 프로젝트 | `erpclub-hub` | 조직에 후임 초대 → Owner 권한 부여 |
| DB 비밀번호 | — | **재확인 불가.** 못 넘겨받으면 대시보드에서 재설정 |

### 자동 발행 루틴 (창립 오너 개인 계정 소유 — §3 참조)

| 루틴 | 주기 | id |
|---|---|---|
| 야간 인사이트 발행 | 월·수·금 05:00 KST | `trig_01Ao7muq8kFdmQDVndkQYvRH` |
| 주간 AI 트렌드 | 월 09:00 KST | `trig_0118sfWk88m1uYZMfcYUTik4` |
| 공고 자동 수집 | 월 09:30 KST | `trig_01GGJVTGdWTkxhCERC6wiGsG` |

## 3. 승계되지 않는 것 (과 그 대체물)

아래는 창립 오너의 **개인 자산**이라 계정째 넘길 수 없다. 각각 대체 경로가 repo 안에 있다.

| 승계 불가 | 이유 | 대체물 (repo 내) |
|---|---|---|
| 자동 발행 루틴 3종 | 오너 개인 claude.ai 계정에 등록됨 | `ops/` 절차 문서 — 후임 계정에 같은 프롬프트로 재등록하거나, 사람이 절차대로 수동 실행 |
| 오너의 AI 스킬·메모리 | 개인 하네스(작업 환경) | 운영에 필요한 내용은 `ops/`·`RUNBOOK.md`에 침전됨 |
| 잔여 토큰 활용 자동화 | 개인 구독 자원 | 대체 없음 — 없어도 운영에 지장 없음(수동 실행으로 동일) |

**루틴이 멈춰도 사이트는 죽지 않는다.** 기사·공고가 안 늘어날 뿐이고, `ops/` 절차의 수동 실행으로 즉시 재개된다.

## 4. 연간 운영 사이클

날짜의 원천 = 커리큘럼 로드맵(`app/src` 내 `aim-roadmap.js` — 화면 "흐름" 탭과 동일). 여기는 국면만 적는다.

1. **모집** (학기 초) — 모집 페이지 국면 전환(`RUNBOOK.md` §9) + 공고·공지 등록
2. **운영** (차시 진행) — 세미나 자료 해금(DB `supabase/README.md`)·기사 발행·공고 갱신
3. **시험기간 휴지** — 중간·기말 앞 14일 규칙(로드맵에 반영돼 있음)
4. **이양** — 학기 후반, 이 문서 §5 실행
5. **회고·아카이브** — 트랙 종료 시 해당 페이지 보관 전환(ADsP 1기 페이지가 선례)

## 5. 이양 체크리스트

순서대로 전부 T가 되면 이양 완료.

- [ ] GitHub 조직 Owner 이양(§2)
- [ ] 룰셋 `19734261` bypass 목록 갱신
- [ ] `deploy.yml` `MAINTAINERS` + `CODEOWNERS` 계정 교체 커밋
- [ ] Actions secrets 3종 존재 확인(값 변경 불필요 — Supabase가 그대로면 유효)
- [ ] Supabase 프로젝트 Owner 권한 부여 + DB 비밀번호 인수(불가 시 재설정)
- [ ] 자동 발행 루틴: 전임 계정 루틴 **정지** → 후임이 `ops/` 프롬프트로 재등록(또는 수동 운영 선언)
- [ ] 설계 배경 문서 사본 전달(운영 헌장·AIM 운영틀·학습정의·릴리스 체계)
- [ ] 워크스페이스(로그인 영역) 운영진 계정 생성·role 부여(`supabase/README.md` §3)
- [ ] 첫 릴리스 1회를 전·후임이 함께 실행(`RUNBOOK.md` §5 — 실습이 곧 검증)

## 6. 재해 복구

- DB를 백지에서 다시 세우는 절차 = `supabase/README.md` §6 (`supabase/migrations/`를 번호순 전량 실행)
- 사이트 자체는 repo가 전부다 — repo가 살아 있으면 GitHub Pages 재연결만으로 복구된다
- 되돌리기(롤백) = `RUNBOOK.md` §7
