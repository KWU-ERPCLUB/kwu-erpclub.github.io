# 백엔드 프로비저닝 절차 (오너 전용)

워크스페이스(`/workspace/`)가 동작하려면 Supabase 프로젝트 1개가 필요하다.
코드는 이미 준비됨 — 아래 6단계만 사람이 실행한다. 개발 지식 불필요, 브라우저 작업이 대부분.

- 원천 spec: `erp-club/docs/specs/2026-08-05-워크스페이스-백엔드.md`
- 현재 상태: 프로젝트 미생성 → 사이트는 "백엔드 연결 대기" 화면 표시(정상 동작·오류 아님)
- 비용: Supabase 무료 플랜 범위

---

## 1단계 — Supabase 프로젝트 생성

1. supabase.com 로그인(GitHub 계정 가능)
2. New project
3. 입력값
   - Name: 오너 결정(spec §8 [미정-6]). 예 `kwu-erpclub`
   - Database Password: 강한 임의 문자열 → **비밀번호 관리자에 보관**(재확인 불가)
   - Region: 오너 결정. 권장 = Northeast Asia (Seoul)
4. 생성 완료까지 약 2분 대기

> 인수인계 주의: 조직(Organization) 소유를 개인 계정 단독으로 두면 이양이 막힌다.
> 가능하면 조직을 만들고 프로젝트를 그 아래에 둔다.

## 2단계 — 마이그레이션 적용 (테이블·권한 생성)

브라우저만으로 가능한 방법(권장):

1. 좌측 메뉴 **SQL Editor** → New query
2. `supabase/migrations/0001_schema.sql` 전체 복사 → 붙여넣기 → Run
3. New query → `supabase/migrations/0002_rls.sql` 전체 복사 → 붙여넣기 → Run
4. **순서 엄수**(0001 먼저). 성공 시 각각 "Success" 표시

CLI를 쓰는 경우(선택): `supabase link --project-ref <ref>` 후 `supabase db push`.

확인:
- Table Editor에 테이블 13개(members·articles·sessions 등) 표시
- 각 테이블 이름 옆 RLS enabled 표시

## 3단계 — 첫 운영진 계정 만들기 (자가입 없음)

가입 폼이 없다 — 계정은 운영진이 만든다(spec §0-4).

1. Authentication > Users > **Add user** → Create new user
   - Email: 오너 이메일 / Password: 임의 지정 / Auto Confirm User 체크
2. 생성된 사용자의 **UID 복사**
3. SQL Editor에서 아래 실행(UID·이름 교체)

```sql
insert into members (id, 이름, role) values ('<복사한 UID>', '신해원', '운영진');
```

4. 스터디원 추가도 같은 방식(3번 SQL의 role만 `'스터디원'`)

## 4단계 — 키 확인

Project Settings > API 에서 2개 값 확인:

| 항목 | 쓰는 곳 |
|---|---|
| Project URL | `VITE_SUPABASE_URL` |
| anon / public key | `VITE_SUPABASE_ANON_KEY` |

- anon key = 브라우저에 노출되는 공개 키(정상). 실제 방어선은 RLS 정책이다.
- **service 키(대시보드 표기 = service role)는 어디에도 붙여넣지 않는다** — 코드·문서·이슈·채팅 전부 금지(판정 P2).
  서버 자동 발행 루틴에서 필요해지면 그때 클라우드 루틴 환경변수에만 넣는다.

## 5단계 — GitHub Actions에 등록 (배포 빌드용)

1. repo `KWU-ERPCLUB/kwu-erpclub.github.io` → Settings > Secrets and variables > **Actions**
2. New repository secret 2건 등록
   - `VITE_SUPABASE_URL` = 4단계 Project URL
   - `VITE_SUPABASE_ANON_KEY` = 4단계 anon key
3. main에 아무 커밋이나 push → 배포 워크플로가 값을 빌드에 주입
   (`.github/workflows/deploy.yml` build 스텝의 `env` — 이미 반영됨)

미등록 상태로 배포해도 사이트는 정상 — `/workspace/`만 대기 화면.

## 6단계 — 로컬 개발 설정

1. `app/.env.example`를 복사해 `app/.env` 생성
2. 4단계 두 값을 채움
3. `npm run dev` → http://localhost:5173/workspace/ 접속 → 3단계 계정으로 로그인

`.env`는 `.gitignore`로 추적 제외 — 실값이 커밋될 경로 없음.

---

## 확인 체크리스트 (전부 T여야 완료)

- [ ] Table Editor에 테이블 13개 + RLS enabled 표시
- [ ] 운영진 멤버 1행이 `members`에 존재
- [ ] `/workspace/`에서 로그인 성공 → 이름·역할 표시
- [ ] 로그아웃 상태에서 SQL Editor 아닌 브라우저 콘솔로 내부 테이블 조회 시도 = 거부(판정 P3)
- [ ] GitHub Actions secrets 2건 등록

## 자주 나오는 문제

| 증상 | 원인·조치 |
|---|---|
| 로그인 후 이름이 비어 있음 | 3단계 `members` insert 누락 — UID로 행 추가 |
| "백엔드 연결 대기" 계속 표시 | env 2종 미주입 — 로컬은 `app/.env`, 배포는 Actions secrets 확인 후 재배포 |
| Invalid login credentials | Auth 사용자 비밀번호 불일치 — Authentication > Users에서 재설정 |
| 0002 실행 실패 | 0001을 먼저 실행했는지 확인(테이블 없으면 정책 생성 불가) |

## 하지 않는 것

- 시드(더미 데이터) 스크립트 없음 — 삭제 연산이 섞이면 데이터 유실 위험(adsp-board 사고 전례). 데이터는 화면·SQL로 직접 입력한다.
- 마이그레이션 파일에 drop·truncate·delete 없음. 스키마 변경은 새 번호 파일 추가로만.
