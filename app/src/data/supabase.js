// Supabase 접속 계층 — 이 파일만 네트워크를 안다(SPEC §1 경계 규칙).
// 컴포넌트는 이 파일을 직접 import 하지 않는다(P1) — data/index.js의 저장소 인터페이스만 소비.
// 키 규칙(§1): anon key만 클라이언트에 둔다. service key는 이 repo 어디에도 두지 않는다(P2).
// 의존성 0 — PostgREST·GoTrue를 fetch로 직접 호출(패키지 추가 = 오너 승인 사항).

import { SESSION_KEY } from './session-key.js'

// env 미설정이면 null. throw 금지 — 미설정 화면(백엔드 연결 대기)이 이 null을 보고 분기한다.
export function readEnv(env) {
  const src = env || (typeof import.meta !== 'undefined' ? import.meta.env : undefined) || {}
  const url = (src.VITE_SUPABASE_URL || '').trim()
  const key = (src.VITE_SUPABASE_ANON_KEY || '').trim()
  if (!url || !key) return null
  return { url: url.replace(/\/+$/, ''), key }
}

function loadSession(storage) {
  if (!storage) return null
  try {
    const raw = storage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveSession(storage, session) {
  if (!storage) return
  try {
    if (session) storage.setItem(SESSION_KEY, JSON.stringify(session))
    else storage.removeItem(SESSION_KEY)
  } catch {
    /* 저장 실패(사생활 보호 모드 등)는 무시 — 메모리 세션으로 계속 동작 */
  }
}

// config 없으면 null 반환(throw 금지). deps = 테스트 주입구(fetch·storage).
export function createBackend(config = readEnv(), deps = {}) {
  if (!config) return null
  const doFetch = deps.fetch || (typeof fetch === 'function' ? fetch : null)
  const storage = deps.storage !== undefined
    ? deps.storage
    : (typeof localStorage !== 'undefined' ? localStorage : null)
  if (!doFetch) return null

  let session = loadSession(storage)

  const baseHeaders = () => ({
    apikey: config.key,
    Authorization: `Bearer ${session?.access_token || config.key}`,
    'Content-Type': 'application/json',
  })

  // 만료 세션 복구 — access_token 만료(401) 시 refresh 1회, 실패하면 익명 강등.
  // 이게 없으면 로그인했던 브라우저에서 공개 페이지까지 401로 죽는다(2026-08-05 라이브 사고).
  async function refreshSession() {
    if (!session?.refresh_token) return false
    try {
      const res = await doFetch(`${config.url}/auth/v1/token?grant_type=refresh_token`, {
        method: 'POST',
        headers: { apikey: config.key, 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: session.refresh_token }),
      })
      if (!res.ok) return false
      const body = await res.json()
      session = { access_token: body.access_token, refresh_token: body.refresh_token, user: body.user || session.user }
      saveSession(storage, session)
      return true
    } catch {
      return false
    }
  }

  async function request(path, options = {}, retried = false) {
    const res = await doFetch(`${config.url}${path}`, {
      ...options,
      headers: { ...baseHeaders(), ...options.headers },
    })
    const text = await res.text()
    let body = null
    try {
      body = text ? JSON.parse(text) : null
    } catch {
      /* 비JSON 오류 응답(프록시 HTML 등) — body 없이 상태코드로 처리 */
    }
    if (!res.ok) {
      if (res.status === 401 && session && !retried) {
        const ok = await refreshSession()
        if (!ok) {
          session = null
          saveSession(storage, null)
        }
        return request(path, options, true)
      }
      const message = body?.msg || body?.message || body?.error_description || `요청 실패(${res.status})`
      throw new Error(message)
    }
    return body
  }

  // ── auth(GoTrue) ──
  const auth = {
    getSession: () => session,
    async signIn(email, password) {
      const body = await request('/auth/v1/token?grant_type=password', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      session = { access_token: body.access_token, refresh_token: body.refresh_token, user: body.user }
      saveSession(storage, session)
      return session
    },
    async signOut() {
      const had = Boolean(session)
      session = null
      saveSession(storage, null)
      if (had) {
        try {
          await request('/auth/v1/logout', { method: 'POST' })
        } catch {
          /* 서버 만료 실패해도 로컬 세션은 이미 제거됨 */
        }
      }
    },
  }

  // ── PostgREST ──
  function buildQuery({ columns, filters, order, limit } = {}) {
    const params = new URLSearchParams()
    params.set('select', columns || '*')
    for (const [col, value] of Object.entries(filters || {})) params.set(col, `eq.${value}`)
    if (order) params.set('order', order)
    if (limit) params.set('limit', String(limit))
    return `?${params.toString()}`
  }

  // 행 삭제가 허용된 테이블(M2) — 상호작용 취소·개인 스크랩 삭제뿐.
  // 콘텐츠·멤버 테이블은 여기 없다 = 앱이 원천 데이터를 지울 경로가 구조적으로 없음.
  const DELETABLE = new Set(['article_likes', 'article_bookmarks', 'collections'])

  const db = {
    select: (table, opts) => request(`/rest/v1/${table}${buildQuery(opts)}`),
    // opts.minimal = 반환 행 없이 insert만(익명 insert 전용 테이블 — representation은 select 권한을 요구해 실패).
    insert: (table, row, opts) => request(`/rest/v1/${table}`, {
      method: 'POST',
      headers: { Prefer: opts?.minimal ? 'return=minimal' : 'return=representation' },
      body: JSON.stringify(row),
    }),
    update: (table, filters, patch) => request(`/rest/v1/${table}${buildQuery({ filters })}`, {
      method: 'PATCH',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify(patch),
    }),
    // 화이트리스트 밖 테이블은 요청 자체를 만들지 않는다(오타·리팩터로 원천이 지워지는 사고 차단).
    remove: (table, filters) => {
      if (!DELETABLE.has(table)) throw new Error(`삭제 불가 테이블: ${table}`)
      return request(`/rest/v1/${table}${buildQuery({ filters })}`, { method: 'DELETE' })
    },
  }

  return { auth, db, config }
}
