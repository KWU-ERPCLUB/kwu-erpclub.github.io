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
