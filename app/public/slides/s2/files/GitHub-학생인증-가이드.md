# GitHub 가입과 학생 인증 가이드 (Copilot Student 받기)

> 초안 2026-09-19 · 오너 실증 캡처 전. `[캡처]` 표시는 오너가 직접 진행하며 화면을 찍어 채울 자리다. 버튼 이름은 캡처할 때 실제 화면과 대조해 고친다.
> VS Code에 Copilot 연결하기는 별도 가이드로 만든다(승인 후 오너 실증).
> ⏸ **보류 (2026-09-19)**: 오너 실증 신청 반려 4회. 1회차 = 결제 정보 이름 불일치. 최종 반려 사유 원문 = ①"Please use your device camera to submit academic affiliation documents"(파일 업로드 불가, 카메라 촬영 필수) ②프로필 이름을 서류와 정확히 일치 + 로그아웃·재로그인. 공식 FAQ(#111352, 2026-06-02 갱신) 대조 후 2단계 인증·캠퍼스 위치·재신청 규칙 추가. 이 조건 전부 갖춰 재시도 → 승인되면 보류 해제.

## 이 가이드로 얻는 것

- GitHub 계정 1개 (학교 메일로 가입)
- GitHub 학생 인증 승인
- Copilot Student: 자동 완성 무제한, 채팅·에이전트용 AI 크레딧 월 200 (2026년 6월 기준, 무료)

## 전체 흐름

| 단계 | 언제 | 하는 일 | 걸리는 시간 |
|---|---|---|---|
| 1 | 세션 중 | 학교 메일로 GitHub 가입 | 5분 |
| 2 | 세션 후 | 영문 재학증명서 발급 → 학생 인증 신청 | 15분 |
| 3 | 승인 메일 받은 뒤 | Copilot Student 켜기 | 5분 |

승인은 며칠에서 2주 정도 걸린다. 기다리는 동안에는 Copilot 무료 버전으로 실습한다.

## 준비물

- 학교 메일 `@kw.ac.kr` (메일함에 로그인할 수 있어야 한다)
- 영문 재학증명서 (2단계에서 발급)

---

## 1단계. 학교 메일로 GitHub 가입 (세션 중)

반드시 `@kw.ac.kr` 메일로 가입한다. 학생 인증을 학교 메일로 확인하기 때문이다.

1. [GitHub 가입 페이지](https://github.com/signup)를 연다
2. 이메일 칸에 학교 메일(`학번@kw.ac.kr` 형태)을 **소문자로** 입력한다
3. 비밀번호와 아이디(영문)를 정한다
4. 학교 메일함에 온 인증 코드를 입력한다 `[캡처]`
5. 가입이 끝나면 오른쪽 위 내 사진 → Settings → Emails에서 학교 메일 옆에 인증 완료 표시가 있는지 확인한다 `[캡처]`

이미 개인 메일로 가입한 계정이 있다면 새로 만들지 않는다. Settings → Emails → Add email address에서 학교 메일을 추가하고, 학교 메일함의 인증 링크를 누르면 된다.

---

## 2단계. 영문 재학증명서 발급 후 학생 인증 신청 (세션 후)

### 2-1. 영문 재학증명서 발급

- 학교 인터넷 증명발급에서 **영문 재학증명서**를 발급해 PDF나 이미지로 저장한다
- 확인할 것: 학교 이름, 영문 이름, 재학 상태, 발급일이 모두 글자로 찍혀 있어야 한다

성적 조회 화면 캡처는 쓰지 않는다. 발급일이 없고 학교 이름이 로고로만 보여 반려되기 쉽다.

### 2-2. 이름을 세 곳에서 똑같이 맞추기 (반려 1순위 원인)

GitHub은 **재학증명서 · 프로필 이름 · 결제 정보 이름** 세 곳이 글자 하나까지 같은지 본다. 하나라도 다르면 자동으로 반려된다. 카드는 등록하지 않아도 된다.

**먼저 재학증명서의 영문 이름을 그대로 옮겨 적는다.** 성과 이름 순서, 띄어쓰기, 대소문자까지 본다.
예: 증명서에 `SHIN HAEWON`으로 적혀 있으면 `Haewon Shin`이나 `Shin Hae Won`은 다른 이름으로 본다.

**① 프로필 이름**
1. 오른쪽 위 내 사진 → Settings → Public profile `[캡처]`
2. Name 칸에 증명서 영문 이름을 그대로 넣는다
3. 아래 Update profile을 누른다

**② 결제 정보 이름**
1. 오른쪽 위 내 사진 → Settings → 왼쪽 메뉴 Billing and licensing → Payment information `[캡처]`
2. Billing information의 Edit(처음이면 추가 버튼)을 누른다
3. 이름 칸에 증명서 영문 이름을 넣는다. 성과 이름이 두 칸으로 나뉘어 있으면 **두 칸을 이어 읽었을 때 증명서와 같은 순서**가 되게 넣는다
   예: 증명서가 `SHIN HAEWON`이면 앞 칸에 `SHIN`, 뒤 칸에 `HAEWON`
4. 주소 칸을 채우고 Save를 누른다

**③ 다시 신청하기 전에 로그아웃 후 다시 로그인한다.** 정보를 고친 뒤에도 신청 화면이 예전 정보를 붙잡고 있는 경우가 보고됐다.

### 2-3. 신청 전 점검 (전부 해 두고 신청한다)

- [ ] **2단계 인증 켜기**: 오른쪽 위 내 사진 → Settings → Password and authentication → 2단계 인증(Two-factor authentication) 켜기. 반려가 반복되는 경우 공식 FAQ가 가장 먼저 확인하라는 항목이다 `[캡처]`
- [ ] **학교에서 신청하기**: 공식 FAQ는 캠퍼스에서 신청할 때 성공률이 가장 높다고 한다. 학교 밖이면 최소한 VPN을 끄고, 브라우저의 위치 권한 요청을 허용한다
- [ ] **증명서 인쇄**: 인쇄한 종이를 카메라로 찍는 방식을 공식 FAQ가 권한다. 인쇄가 어려우면 모니터에 크게 띄운다
- [ ] **이름 세 곳 일치 + 로그아웃·재로그인** (2-2)

### 2-4. 학생 인증 신청

1. [GitHub 학생 혜택 신청](https://education.github.com/pack)을 연다
2. 학생 혜택 신청 버튼을 누르고 Student를 고른다 `[캡처]`
3. 이메일은 학교 메일(`@kw.ac.kr`)을 고른다. 학교 이름이 Kwangwoon University로 뜨는지 확인한다 `[캡처]`
4. **휴대폰으로 이 신청 화면을 연다.** 서류는 파일로 올리면 반려되고, 기기 카메라로 찍어 내야 한다(반려 사유 원문: Please use your device camera). 카메라 권한을 허용한다
5. 서류 종류 선택 칸(Please select the type of academic enrollment proof)에서 **3. Dated enrollment letter on school letterhead**를 고른다. 재학증명서가 이 항목이다 `[캡처]`
6. 재학증명서 PDF를 모니터에 크게 띄우거나 인쇄해 두고, 신청 화면의 카메라로 증명서 전체를 찍는다. 흐리지 않게, 글자가 다 보이게 찍는다 `[캡처]`
7. 제출한다. 처리 결과는 가입한 메일로 온다

성적 조회 화면 캡처를 올리려고 8. Other(포털 캡처)를 고르지 않는다. 검토가 까다로워 반려되기 쉽다.

**PC에 카메라가 없으면**

1. 휴대폰 브라우저에서 GitHub에 로그인해 신청을 처음부터 진행한다. 증명서는 PC 모니터에 띄우거나 인쇄해 폰 카메라로 찍는다 (가장 간단하다)
2. PC에서 이어 가야 하면 휴대폰을 웹캠으로 연결한다. Windows 11 휴대폰과 연결(안드로이드), DroidCam(안드로이드), Camo(아이폰) 중 하나를 쓴다
3. 카메라를 쓸 기기가 전혀 없으면 [GitHub 지원 센터](https://support.github.com)에 사정을 적어 수동 확인을 요청한다

가상 카메라 프로그램에 이미지 파일을 띄워 찍은 것처럼 내는 방법은 쓰지 않는다. 카메라 촬영을 요구하는 취지를 우회하는 것이다.

---

## 3단계. 승인 후 Copilot Student 켜기

승인됐다고 Copilot이 저절로 켜지지 않는다. 승인과 Copilot 켜기는 따로 해야 한다.

1. 승인 메일을 확인한다 `[캡처]`
2. [학생 혜택 설정](https://github.com/settings/education/benefits)을 열어 Copilot 혜택을 켠다 `[캡처]`
3. [Copilot 설정](https://github.com/settings/copilot)에서 현재 요금제가 Copilot Student로 표시되는지 확인한다 `[캡처]`

혜택은 승인 후 3일 안에 들어온다(공식 FAQ). 5일이 지나도 안 들어오면 GitHub Education 커뮤니티에 문의한다. Copilot을 켠 뒤 VS Code가 이미 열려 있었다면 껐다 켠다.

---

## 반려됐을 때

반려 메일에 적힌 이유를 먼저 본다. 흔한 원인은 일곱 가지다.

| 원인 | 고치는 법 |
|---|---|
| 서류 이름과 결제 정보 이름이 다름 | 2-2로 돌아가 **프로필 이름과 결제 정보 이름 둘 다** 서류와 똑같이 맞추고, 로그아웃 후 다시 로그인해 신청한다 |
| 서류에 날짜가 없음 | 발급일이 찍힌 재학증명서로 다시 올린다 |
| 카메라로 찍으라는 사유 | 파일 업로드 대신 휴대폰 카메라로 증명서를 찍어 낸다 (2-4의 4번) |
| 서류가 흐림 | 밝은 곳에서 증명서 전체가 화면에 들어오게 다시 찍는다 |
| 학교 메일 미인증 | 1단계 5번으로 돌아가 인증 완료 표시를 확인한다 |
| 캠퍼스 근처가 아니라는 사유 | 학교에서 다시 신청하거나 VPN을 끄고 위치 권한을 허용한다 |
| 사유 없이 반복 반려 | 2단계 인증이 켜져 있는지 확인한다 (2-3) |

**아무것도 바꾸지 않고 다시 신청하지 않는다.** 공식 FAQ는 프로필·서류·신청 내용을 고친 경우에만 재신청하라고 한다. 고친 뒤 같은 페이지에서 다시 신청하면 된다. 이름을 맞췄는데도 같은 이유로 또 반려되면 다른 기기(휴대폰 등)에서 신청해 보고, 그래도 안 되면 [GitHub 지원 센터](https://support.github.com)에 문의한다.

## 알아 둘 것

- 학교 메일은 졸업하면 막힐 수 있다. 승인 뒤 Settings → Emails에서 개인 메일도 추가해 두면 계정을 잃지 않는다
- 학생 혜택은 재학 중에만 유지된다. 주기적으로 재학 확인을 다시 요청받을 수 있다
- AI 크레딧 월 200은 채팅과 에이전트를 쓸 때만 줄어든다. 자동 완성은 차감되지 않는다

## 출처

- [GitHub 공식 문서: 학생 신청 요건](https://docs.github.com/en/education/about-github-education/github-education-for-students/apply-to-github-education-as-a-student)
- [GitHub 공식 문서: 신청 문제 해결](https://docs.github.com/en/education/about-github-education/github-education-for-students/solving-problems-with-your-github-education-access)
- [GitHub Education 공식 FAQ: Student Pack·Copilot Student](https://github.com/orgs/community/discussions/111352) (2026-06-02 갱신)
- [GitHub 커뮤니티: 성이 앞에 오는 이름 반려 해결 사례](https://github.com/orgs/community/discussions/179617)
- [GitHub 커뮤니티: 카메라 없는 사용자의 신청 방법](https://github.com/orgs/community/discussions/168621)
- [GitHub 커뮤니티: 카메라 없이 인증하는 대안](https://github.com/orgs/community/discussions/177667)
- [GitHub 공식 문서: 결제 정보 관리](https://docs.github.com/billing/managing-your-github-billing-settings/adding-or-editing-a-payment-method)
- [GitHub 공식 문서: Copilot Student 켜기](https://docs.github.com/copilot/how-tos/manage-your-account/free-access-with-copilot-student)
- [GitHub 공식 문서: Copilot 요금제](https://docs.github.com/en/copilot/get-started/plans)
