# RUNBOOK — 운영 런북

> 독자 = 이 사이트를 운영하는 사람(비개발자 학부생 전제).
> 목적 = **AI가 없어도, 코드를 몰라도** 정기 운영이 돌아가게 하는 절차서.
> 필독 순서·계정 목록 = `HANDOVER.md`. 데이터(DB) 운영 = `supabase/README.md`. 기사 규격 = `CONTRIBUTING.md`.

목차

1. 운영의 두 경로 — AI 경로와 사람 폴백
2. 코드 없이 GitHub 웹만으로 되는 일
3. 로컬 개발 환경 (코드를 만질 때만)
4. 브랜치 규칙 — main과 dev
5. 릴리스 절차
6. 배포가 실패했을 때
7. 롤백 (잘못 나간 것 되돌리기)
8. 기사 삭제 체크리스트
9. 모집 국면 전환
10. 캡처(스크린샷) 안전 규칙

---

## 1. 운영의 두 경로 — AI 경로와 사람 폴백

정기 운영 작업은 전부 두 방법을 병기한다. 어느 쪽으로 해도 결과가 같다.

| 작업 | AI 경로 | 사람 폴백 |
|---|---|---|
| 인사이트 기사 발행 | `ops/인사이트-발행-절차.md`를 프롬프트로 사용 | 같은 문서의 사람 단계 절 |
| 주간 트렌드 발행 | `ops/주간-트렌드-절차.md`를 프롬프트로 사용 | 같은 문서의 사람 단계 절 |
| 공고 갱신 | `ops/공고-수집-하네스.md` + `supabase/postings.json` 편집 | 워크스페이스 운영 탭에서 직접 등록 |
| 계정 생성·DB | — | `supabase/README.md` §3 |

- ops/ 문서는 **단계가 전부 쪼개져 있어** 높은 성능의 AI가 아니어도(또는 사람이 직접 해도) 실행된다.
- AI에게 시킬 때는 해당 ops 문서 전체를 붙여 넣고 "이 절차대로 실행"이라고 지시하면 된다.

## 2. 코드 없이 GitHub 웹만으로 되는 일

로컬 환경 없이 브라우저(github.com)만으로 가능한 운영 작업.

- **기사 발행**: repo에서 `app/content/기사/` 열기 → Add file → `YYYY-MM-DD-<작성자>-<슬러그>.md` 작성(규격 = `CONTRIBUTING.md`) → **main에 commit**(콘텐츠는 main 직행 허용 — §4). Actions가 초록이면 몇 분 안에 사이트에 뜬다.
- **기사 수정**: 해당 md 파일 열기 → 연필 아이콘 → 수정 → main에 commit.
- **공고 추가**: `supabase/postings.json` 편집 → main에 commit. CI가 DB에 자동 반영한다(`supabase/README.md` §2).
- **배포 상태 확인**: repo > Actions 탭. 초록 = 정상, 빨강 = §6.
- **수동 재배포**: Actions > "Deploy to GitHub Pages" > Run workflow.

비운영진 계정으로 `app/content/` 밖을 바꾸면 CI가 막는다(`deploy.yml`의 guard — 운영진 목록은 `deploy.yml`의 `MAINTAINERS` 한 줄).

## 3. 로컬 개발 환경 (코드를 만질 때만)

1. Node.js 24 설치 (nodejs.org LTS)
2. repo clone → `cd app` → `npm ci`
3. `npm run dev` → http://localhost:5173/ 확인
4. 워크스페이스(로그인 영역)까지 보려면 `supabase/README.md` §5의 `.env` 2값 설정

검증 3종(commit 전 실행 습관):

```
npm run validate   # 콘텐츠 규격 검사
npm test           # 자동 테스트
npm run build      # 빌드 성공 여부
```

## 4. 브랜치 규칙 — main과 dev

| 브랜치 | 정의 | 들어가는 것 |
|---|---|---|
| `main` | **배포판** — push되면 라이브에 나간다 | 릴리스 머지 · 아래 예외 3종 |
| `dev` | **작업대** — push해도 배포되지 않는다(검증만 돈다) | 다음 릴리스에 나갈 코드 전부 |

main 직행이 허용되는 예외 3종 (이 목록에 없으면 전부 dev):

1. **콘텐츠** — 기사·공고(루틴·기고 PR 포함). 버전 변동 없음
2. **오타·사실오류 정정** — patch 버전(예: 0.12.0 → 0.12.1)
3. **깨진 화면·장애 수리** — patch 버전

예외 2·3은 main 커밋 후 **같은 작업 안에서** dev로 백머지한다(`git merge main` on dev).

## 5. 릴리스 절차

오너(운영 책임자)가 결정한 시점에 실행한다. 정기 일정 없음.

1. dev에서 검증 3종(§3) 전부 통과 확인 — 하나라도 실패하면 중단
2. `CHANGELOG.md`에 이번 버전 절 작성 + `app/package.json`의 `version` 올림(dev에 커밋)
   - 기능 추가·화면 개편 = 가운데 숫자(0.12.0 → 0.13.0) / 수정만 = 끝 숫자(→ 0.12.1)
3. `git checkout main` → `git merge dev --no-ff`
4. `git tag vX.Y.Z` → `git push origin main --tags`
5. Actions 배포 완료(초록) 확인 → 라이브 URL 확인
6. `git checkout dev` → `git merge main` → push (백머지)

⚠순서 5를 건너뛰고 6의 push를 먼저 하면 **main 배포 런이 취소된다**(같은 배포 슬롯을 두 push가 다퉈
나중 것이 앞 것을 밀어냄 — 실사고 2회). 취소됐으면 Actions > Run workflow로 재실행하면 된다.

## 6. 배포가 실패했을 때

Actions 빨간 런을 열어 **어느 스텝에서 죽었는지**부터 본다.

| 실패 스텝 | 의미 | 조치 |
|---|---|---|
| `npm run validate` | 콘텐츠 규격 위반(frontmatter 오류·필수 필드 누락 등) | 로그의 파일명·사유대로 md 수정 후 다시 commit |
| `npm test` | 자동 테스트 실패 | 로그의 실패 테스트명 확인. 기사 삭제가 원인이면 §8 |
| `npm run build` | 빌드 자체 실패(문법 오류 등) | 마지막으로 바꾼 파일을 되돌린다(§7) |
| `sync-content` / `sync postings` | DB 동기화 실패 | **사이트 배포는 정상.** secret 3종 등록 확인(`supabase/README.md` §4) 후 Run workflow로 재실행 |

원인을 못 찾겠으면: 빨간 런의 로그 전문을 복사해 AI에게 붙여 넣고 "이 CI 실패 원인과 수정 방법"을 묻는다.

## 7. 롤백 (잘못 나간 것 되돌리기)

- 유일 경로 = **revert**: `git revert <문제 커밋>` → main에 push → 재배포. patch 버전을 올리고 CHANGELOG에 기록한다.
- GitHub 웹 폴백: 문제 커밋이 PR 머지였다면 PR 화면의 Revert 버튼.
- `force push`·`reset --hard`는 쓰지 않는다 — 이력이 사라져 협업자·루틴과 어긋난다.
- "어느 시점으로 돌아갈지"는 릴리스 태그 목록(repo > Tags)에서 고른다.

## 8. 기사 삭제 체크리스트

기사 md를 지우면 그 기사를 참조하는 테스트가 깨질 수 있다(실사고 1회).

1. 삭제할 기사의 슬러그(파일명에서 날짜·작성자 뺀 부분)로 `app/src` 전체 검색(grep)
2. 테스트 파일에서 걸리면 그 참조를 먼저 수정
3. md 삭제 → 검증 3종 → main에 commit(오류 정정 = 예외 2)
4. DB에도 남아 있으면 Supabase Table Editor의 `articles`에서 해당 행 삭제

## 9. 모집 국면 전환

모집 시작·마감 시 바꾸는 곳. 원천 = `app/src`의 모집 상수(검색어: `RECRUIT`).

1. dev에서 모집 창 날짜·문구 수정 → 검증 3종 → 릴리스(§5)
2. 워크스페이스 공지·이벤트는 운영 탭에서 등록(코드 아님)

### 9-1. 신청 알림 메일

신청 폼 제출마다 오너 메일로 내용이 온다 — 구조·설정·끄기 = `ops/신청-알림-메일.md`(Supabase 웹훅 → Apps Script → Gmail, 0원). 메일이 안 오면 그 문서 §3.

## 10. 캡처(스크린샷) 안전 규칙

기사·문서에 화면 캡처를 넣을 때:

- 실명·학번·이메일은 **전량 블러**(모자이크) 처리
- 로그인 화면·계정 정보가 담긴 캡처는 **게스트·테스트 계정으로만** 재현해서 찍는다
- 재현해 찍은 화면은 본문에 "재현 화면"임을 밝힌다
