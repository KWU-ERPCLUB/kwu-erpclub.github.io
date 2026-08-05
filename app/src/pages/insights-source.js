// 인사이트 데이터 출처 — DB(서빙 원천) ↔ md 글롭(폴백). SPEC §0-6·§1 "클라이언트 페치".
// 이 파일이 공개 페이지에서 유일하게 data/index.js를 import 한다(경계 테스트가 이 예외를 명시적으로 잡고 있다).
// 규칙:
//   env 2종 설정됨 → DB의 게재 기사만 페치(RLS도 게재만 내주지만 쿼리에서도 명시).
//   env 미설정     → 기존 md 글롭(로컬 dev·포크·백엔드 장애 전 상태에서 사이트가 그대로 돈다).
import { useCallback, useEffect, useState } from 'react'
import { getRepositories, isBackendConfigured } from '../data/index.js'
import { loadContent } from '../content/loader.js'
import { fromDbRow, sortByDateDesc } from '../content/db-map.js'

// md 글롭 폴백 — 빌드타임에 번들된 content/기사/*.md.
export function mdArticles() {
  return loadContent('기사')
}

// 반환 = { items, status: 'ready'|'loading'|'error', error, retry, source: 'db'|'md' }
// repos·configured = 테스트 주입구(P4 — 네트워크 없이 두 경로 모두 검증 가능).
export function useArticles({ repos, configured } = {}) {
  const ready = configured === undefined ? isBackendConfigured() : configured
  const [store] = useState(() => repos || (ready ? getRepositories() : null))
  const [state, setState] = useState(() => (ready
    ? { items: [], status: 'loading', error: '' }
    : { items: mdArticles(), status: 'ready', error: '' }))
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!ready || !store) return undefined
    let alive = true
    setState((s) => (s.status === 'loading' ? s : { ...s, status: 'loading', error: '' }))
    store.articles.listPublished()
      .then((rows) => {
        if (!alive) return
        const items = sortByDateDesc((rows || []).filter((r) => r['상태'] === undefined || r['상태'] === '게재').map(fromDbRow))
        setState({ items, status: 'ready', error: '' })
      })
      .catch((e) => {
        if (!alive) return
        setState({ items: [], status: 'error', error: e?.message || '불러오기 실패' })
      })
    return () => { alive = false }
  }, [ready, store, attempt])

  const retry = useCallback(() => setAttempt((n) => n + 1), [])
  return { ...state, retry, source: ready ? 'db' : 'md' }
}

// 북마크·좋아요(D3: 열람=공개, 상호작용=로그인 멤버).
// 비로그인 = 총계만 보이고 클릭하면 워크스페이스 안내. md 폴백(백엔드 미설정) = 기능 자체 미노출.
export function useInteractions({ repos, configured } = {}) {
  const ready = configured === undefined ? isBackendConfigured() : configured
  const [store] = useState(() => repos || (ready ? getRepositories() : null))
  const [counts, setCounts] = useState({})     // article_id → { 좋아요수, 북마크수 }
  const [mine, setMine] = useState({ likes: [], bookmarks: [] })
  const [notice, setNotice] = useState('')
  const loggedIn = Boolean(ready && store && store.auth.currentUser())

  useEffect(() => {
    if (!ready || !store) return undefined
    let alive = true
    store.interactions.counts()
      .then((rows) => {
        if (!alive) return
        setCounts(Object.fromEntries((rows || []).map((r) => [r.article_id, r])))
      })
      .catch(() => { /* 카운트 실패는 조용히 0 표기 — 본문 열람을 막지 않는다 */ })
    if (loggedIn) store.interactions.mine().then((m) => { if (alive) setMine(m) }).catch(() => {})
    return () => { alive = false }
  }, [ready, store, loggedIn])

  // kind = 'like' | 'bookmark'. 낙관적 갱신 후 실패하면 되돌린다.
  const toggle = useCallback(async (kind, articleId) => {
    if (!loggedIn) {
      setNotice('북마크·좋아요 = 워크스페이스 로그인 후 이용(/workspace/)')
      return
    }
    const key = kind === 'like' ? 'likes' : 'bookmarks'
    const field = kind === 'like' ? '좋아요수' : '북마크수'
    const on = !mine[key].includes(articleId)
    const before = { mine, counts }
    setMine((m) => ({ ...m, [key]: on ? [...m[key], articleId] : m[key].filter((x) => x !== articleId) }))
    setCounts((c) => {
      const row = c[articleId] || { article_id: articleId, 좋아요수: 0, 북마크수: 0 }
      return { ...c, [articleId]: { ...row, [field]: Math.max(0, (row[field] || 0) + (on ? 1 : -1)) } }
    })
    try {
      if (kind === 'like') await store.interactions.toggleLike(articleId, on)
      else await store.interactions.toggleBookmark(articleId, on)
    } catch (e) {
      setMine(before.mine)
      setCounts(before.counts)
      setNotice(e?.message || '처리 실패')
    }
  }, [loggedIn, mine, counts, store])

  return {
    enabled: Boolean(ready && store),
    loggedIn,
    notice,
    countsOf: (articleId) => counts[articleId] || { 좋아요수: 0, 북마크수: 0 },
    liked: (articleId) => mine.likes.includes(articleId),
    bookmarked: (articleId) => mine.bookmarks.includes(articleId),
    toggle,
  }
}
