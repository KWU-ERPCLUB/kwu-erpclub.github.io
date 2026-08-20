# 백엔드 운영 문서 (오너·인수인계자용)

워크스페이스(`/workspace/`)의 데이터 계층 = Supabase 프로젝트 1개.

- **현재 상태 = 라이브.** 프로젝트 `erpclub-hub` 운영 중, `migrations/` 전량 적용 완료(2026-08-19 기준).
- 원천 spec = `erp-club/docs/specs/2026-08-05-워크스페이스-백엔드.md`
- 비용 = Supabase 무료 플랜 범위
- 이 문서 = **운영·인수인계 절차서**. 스키마 사실의 원천은 항상 `migrations/`다.

목차

1. 새 마이그레이션 적용 (상시 작업)
2. 공고 자동 등록 파이프라인
3. 계정 만들기 (운영진·스터디원)
4. 키·환경변수
5. 인수인계 / 새 기기 온보딩
6. 백지에서 재구축 (재해 복구·이관)
7. 문제 해결
8. 하지 않는 것

---

## 1. 새 마이그레이션 적용 (상시 작업)

가장 자주 하는 일. 코드가 새 컬럼·새 테이블을 요구하면 `migrations/`에 번호 파일이 추가되고,
**사람이 Supabase SQL 에디터에서 1회 실행**한다(자동 적용 없음).

1. 좌측 메뉴 **SQL Editor** → New query
2. `migrations/` 안에서 **아직 실행하지 않은 번호 파일**을 연다
3. 전체 복사 → 붙여넣기 → Run → "Success" 확인
4. 여러 개면 **번호 오름차순**으로 하나씩 반복

원칙 3개만 기억하면 된다.

- **번호순 실행이 유일한 규칙** — 앞 번호가 뒤 번호의 전제다(예: 정책 생성은 테이블이 먼저 있어야 한다)
- **후속 번호는 재실행 안전(멱등)** — `if exists` / `if not exists`로 쓰여 있어 어디까지 돌렸는지 헷갈리면 다시 돌려도 된다.
  초기 생성 파일(0001·0002)만 예외 — 이미 있는 테이블 위에 다시 돌리면 "already exists" 오류가 난다(피해는 없다)
- **미적용이어도 사이트는 죽지 않는다** — 해당 기능만 빈 안내로 강등된다(오류 화면 아님)

각 파일 첫머리 주석에 "무엇을·왜·언제부터"가 적혀 있다. 실행 전에 그 주석만 읽으면 충분하다.

CLI를 쓰는 경우(선택): `supabase link --project-ref <ref>` 후 `supabase db push`.

> 적용 여부 확인법: Table Editor에서 해당 테이블·컬럼이 보이는지 본다.
> 테이블 목록·개수를 여기 적어두지 않는다 — `migrations/`가 원천이고, 적어두면 낡는다.

## 2. 공고 자동 등록 파이프라인

공고 보드(워크스페이스 공고 탭)는 **SQL을 사람이 치지 않는다.** 인사이트 md→DB 동기화와 같은 구조다.

```
supabase/postings.json  →  (push)  →  CI 잡 sync-content  →  postings · events upsert
      원천 파일                        deploy.yml 스텝               DB
```

- **원천 = `supabase/postings.json`** 한 곳. 이 파일을 고쳐 push하면 CI가 DB에 반영한다
- 갱신 주체 = **주간 클라우드 루틴**(월 09:30 KST) + 교내 루틴(매일 09:00). 수집 기준·수집처 = `../ops/공고-수집-하네스.md`
- 반영 시점 = **`main` push 시**(CI `sync-content` 잡). dev push로는 DB가 바뀌지 않는다
- 충돌 키 = `postings."키"`. 같은 키 = 갱신, 새 키 = 추가, **삭제 연산 없음**
- 운영 탭에서 사람이 등록한 행은 키가 비어 있어 파이프라인과 충돌하지 않는다(공존)
- 사전 조건 = 마이그레이션 `0014`~`0016` 적용(키 컬럼·구독·세부 분류)
- 로컬 확인 = `cd app && node scripts/sync-postings-db.mjs --dry` (네트워크 0)
- 실행 env = `SUPABASE_URL`·`SUPABASE_SERVICE_KEY`. **secret에서만 온다 — repo 금지**

secret이 없으면 CI가 이 스텝을 건너뛰고 배포는 정상 진행한다(공고만 안 늘어난다).

## 3. 계정 만들기 (운영진·스터디원)

가입 폼이 없다 — 계정은 운영진이 만든다(spec §0-4).
**로그인 ID = 학번**(이메일 아님). 내부적으로 학번을 가상 이메일로 바꿔 저장한다.

- 매핑 규칙: 학번 `2021123456` → `s2021123456@member.erpclub`
- 규칙 원천 = `app/src/data/login-id.js` (변경 시 이 문서도 같이 고친다)
- `member.erpclub` = 실존하지 않는 도메인 — 메일 발송 기능이 없으므로 문제되지 않는다
- 오너·운영진은 이메일 로그인 유지 가능(입력창에 `@`가 들어가면 이메일 그대로 처리)

### 방법 A — 대시보드 (1~2명)

1. Authentication > Users > Add user > Create new user
   - Email: `s<학번>@member.erpclub` (운영진은 실제 이메일)
   - Password: **공통 초기 비밀번호 `000000`**(Supabase 최소 6자라 `0000` 불가)
   - **Auto Confirm User 체크**
2. 생성된 UID 복사 → SQL Editor

```sql
insert into members (id, 이름, role, 학번)
values ('<복사한 UID>', '<이름>', '스터디원', '<학번>');
```

- 운영진이면 `role`을 `'운영진'`으로. 운영진 행이 하나도 없으면 운영 탭에 아무도 못 들어간다
- 전공을 받아뒀다면(운영진만 열람):

```sql
insert into member_private (member_id, 전공) values ('<복사한 UID>', '<전공>');
```

### 방법 B — admin API (여러 명 한 번에)

service 키가 필요하다. **로컬 터미널에서만** 환경변수로 넘기고, 파일·커밋에 남기지 않는다(판정 P2).

```bash
curl -X POST "$SUPABASE_URL/auth/v1/admin/users" \
  -H "apikey: $SUPABASE_SERVICE_KEY" -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"s2021123456@member.erpclub","password":"<임시>","email_confirm":true}'
```

응답의 `id`가 UID → 위 `members` insert를 그대로 실행한다.

### 비밀번호

- **본인 변경** = 첫 로그인 후 **내정보 탭 > 비밀번호 변경**(로그인 상태라 메일 불필요).
  초대 안내문에 "첫 로그인 후 비밀번호 변경" 한 줄을 꼭 포함한다
- **잊어버린 경우** = 셀프 "찾기"는 불가(메일 발송 = 비범위). 운영진이 Authentication > Users에서
  `000000`으로 재설정하고 본인 변경을 안내한다
- `members.학번`은 unique — 같은 학번으로 계정 2개를 만들 수 없다

## 4. 키·환경변수

Project Settings > API 에서 확인한다.

| 값 | 쓰는 곳 | 성격 |
|---|---|---|
| Project URL | `VITE_SUPABASE_URL` | 공개 |
| anon / public key | `VITE_SUPABASE_ANON_KEY` | 공개(브라우저 노출 정상 — 방어선은 RLS) |
| service role key | CI secret `SUPABASE_SERVICE_KEY` | **비공개** |

- **service 키는 어디에도 붙여넣지 않는다** — 코드·문서·이슈·채팅 전부 금지(판정 P2).
  들어가는 곳은 GitHub Actions secret과 클라우드 루틴 환경변수 두 곳뿐이다
- 등록 위치 = repo `KWU-ERPCLUB/kwu-erpclub.github.io` > Settings > Secrets and variables > **Actions**
  (`VITE_SUPABASE_URL` · `VITE_SUPABASE_ANON_KEY` · `SUPABASE_SERVICE_KEY`)
- 키 이름 목록 = `app/.env.example`

## 5. 인수인계 / 새 기기 온보딩

**새 기기에서 개발만 하려는 경우** — DB는 이미 살아 있으므로 3단계면 끝난다.

1. `app/.env.example`를 복사해 `app/.env` 생성
2. §4의 Project URL · anon key 두 값을 채움
3. `npm run dev` → http://localhost:5173/workspace/ 접속 → 본인 계정으로 로그인

`.env`는 `.gitignore`로 추적 제외 — 실값이 커밋될 경로가 없다.
env 2종 미설정도 정상 상태다(목 저장소 폴백 + "백엔드 연결 대기" 화면).

**소유권을 넘겨받는 경우** — 아래를 함께 이전받는다.

- [ ] Supabase 조직·프로젝트 소유권 또는 owner 권한
- [ ] DB 비밀번호(재확인 불가 — 넘겨받지 못하면 재설정)
- [ ] GitHub org `KWU-ERPCLUB` 권한 + Actions secret 3종
- [ ] 클라우드 루틴(주간 공고·주간 트렌드·야간 인사이트) 소유 계정

> 조직(Organization) 소유가 개인 계정 단독이면 이양이 막힌다. 조직 아래에 프로젝트를 둔다.

## 6. 백지에서 재구축 (재해 복구·이관)

현재는 필요 없다. 프로젝트를 새로 파야 할 때만 쓴다.

1. supabase.com > New project — Name `kwu-erpclub`, Region = Northeast Asia (Seoul),
   DB Password = 강한 임의 문자열(**비밀번호 관리자에 보관 — 재확인 불가**)
2. §1 절차로 `migrations/`를 **0001부터 번호순 전량** 실행
3. §3으로 운영진 계정 1개 생성
4. §4로 키 확인 → Actions secret 등록 → `main` push 시 빌드에 주입
5. `main`에 push하면 CI가 인사이트 md·공고 JSON을 DB에 채운다(§2)

확인 체크리스트(전부 T여야 완료)

- [ ] Table Editor의 각 테이블에 **RLS enabled** 표시
- [ ] 운영진 멤버 1행이 `members`에 존재
- [ ] `/workspace/` 로그인 성공 → 이름·역할 표시
- [ ] 로그아웃 상태에서 브라우저 콘솔로 내부 테이블 조회 시도 = 거부(판정 P3)
- [ ] Actions secret 3종 등록

## 7. 문제 해결

| 증상 | 원인·조치 |
|---|---|
| 로그인 후 이름이 비어 있음 | `members` insert 누락 — UID로 행 추가(§3) |
| "백엔드 연결 대기" 계속 표시 | env 2종 미주입 — 로컬은 `app/.env`, 배포는 Actions secrets 확인 후 재배포 |
| Invalid login credentials | Auth 비밀번호 불일치 — Authentication > Users에서 재설정 |
| 특정 탭만 빈 안내 | 그 기능의 마이그레이션 미적용 — 해당 번호 파일 Run(§1) |
| 마이그레이션 실행 실패 | 앞 번호를 건너뛰었을 가능성 — 번호순으로 다시 확인 |
| 공고가 안 늘어남 | `main` push가 없었거나 Actions secret 미등록 — CI `sync-content` 잡 로그 확인(§2) |

## 8. 하지 않는 것

- **시드(더미 데이터) 스크립트 없음** — 삭제 연산이 섞이면 데이터 유실 위험(adsp-board 사고 전례).
  데이터는 화면·파이프라인·SQL로 직접 넣는다
- **마이그레이션에 drop·truncate·delete 없음.** 스키마 변경은 새 번호 파일 추가로만
- **일회성 정리 SQL은 실행 후 남기지 않는다** — 실행하고 나면 지운다(git 이력이 보관).
  `migrations/`에는 반복 적용 가능한 파일만 둔다
