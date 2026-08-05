// 워크스페이스 세션의 localStorage 키 — 단일 원천.
// 쓰는 쪽 = supabase.js(로그인·로그아웃) / 읽는 쪽 = session-flag.js(공개 헤더의 존재 확인).
// 두 파일이 같은 문자열을 따로 갖지 않도록 여기 하나만 둔다.
export const SESSION_KEY = 'erpclub.workspace.session'
