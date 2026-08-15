// 작성자 표시명 레지스트리(2026-08-15 오너) — 화면에는 계정 id가 아니라 사람 이름이 보인다.
//
// id는 못 바꾼다: 파일명 규약이 `YYYY-MM-DD-<author>-<슬러그>.md`이고 schema.js가 그 프리픽스를 검증한다
// (id를 실명으로 갈면 기존 파일명·슬러그·딥링크가 전부 깨진다). 그래서 표시 계층에서만 이름으로 옮긴다.
//
// 새 스터디원 = 여기 한 줄 추가. 미등록 id는 입력값 그대로 보여준다(빈칸으로 사라지지 않게).
export const AUTHOR_NAMES = {
  bapzzi: '신해원',
}

export function authorName(id) {
  const v = String(id ?? '').trim()
  return AUTHOR_NAMES[v] || v
}
