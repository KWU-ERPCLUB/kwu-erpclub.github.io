// 데이터 계층 진입점 — 화면은 이 파일에서만 저장소를 얻는다(SPEC §1 경계 규칙, 판정 P1).
// env(VITE_SUPABASE_URL·VITE_SUPABASE_ANON_KEY)가 있으면 Supabase 저장소, 없으면 목 저장소.
// 미설정은 오류가 아니다 — 워크스페이스가 "백엔드 연결 대기" 화면으로 분기한다.
import { createBackend, readEnv } from './supabase.js'
import { createSupabaseRepositories } from './repositories.js'
import { createMockRepositories } from './mock.js'

export { REPO_CONTRACT } from './repositories.js'

export function isBackendConfigured(env) {
  return readEnv(env) !== null
}

// deps = 테스트 주입구(fetch·storage). 반환값은 항상 저장소 객체(널 아님).
export function getRepositories({ env, deps } = {}) {
  const backend = createBackend(readEnv(env), deps || {})
  return backend ? createSupabaseRepositories(backend) : createMockRepositories()
}
