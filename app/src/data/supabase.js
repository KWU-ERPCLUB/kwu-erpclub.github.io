// Supabase 접속 계층 — 이 파일만 네트워크를 안다(SPEC §1 경계 규칙).
// 컴포넌트는 이 파일을 직접 import 하지 않는다(P1) — data/index.js의 저장소 인터페이스만 소비.
// 키 규칙(§1): anon key만 클라이언트에 둔다. service key는 이 repo 어디에도 두지 않는다(P2).
// 의존성 0 — PostgREST·GoTrue를 fetch로 직접 호출(패키지 추가 = 오너 승인 사항).

const SESSION_KEY = 'erpclub.workspace.session'

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

  async function request(path, options = {}) {
    const res = await doFetch(`${config.url}${path}`, {
      ...options,
      headers: { ...baseHeaders(), ...options.headers },
    })
    const text = await res.text()
    const body = text ? JSON.parse(text) : null
    if (!res.ok) {
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

  const db = {
    select: (table, opts) => request(`/rest/v1/${table}${buildQuery(opts)}`),
    insert: (table, row) => request(`/rest/v1/${table}`, {
      method: 'POST',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify(row),
    }),
    update: (table, filters, patch) => request(`/rest/v1/${table}${buildQuery({ filters })}`, {
      method: 'PATCH',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify(patch),
    }),
  }

  return { auth, db, config }
}
