// 워크스페이스 북마크 탭(2026-08-07 오너 개정) — 링크 스크랩 UI 폐지, **북마크한 인사이트만 한눈에**.
// (collections 데이터 계층·테이블은 유지 — 화면만 제거. 재도입 = 오너 승인.)
// 북마크 추가·해제 = 공개 인사이트 상세에서. 여기는 읽기 전용 모음면.
import { useCallback, useEffect, useState } from 'react'

// 북마크 1행 — 인사이트 카드 요약(성격·제목·설명·게재일 + 상세 링크).
function MarkRow({ m }) {
  const a = m.articles
  if (!a) {
    return <li className="ws-scrap"><span className="ws-mark-meta">(삭제된 기사)</span></li>
  }
  return (
    <li className="ws-scrap">
      <div className="ws-row-top">
        <span className="ws-mark-meta">{a['성격'] || ''}</span>
        <span className="ws-mark-meta">{a['게재일'] || ''}</span>
      </div>
      <a className="ws-scrap-url" href={`/insights/?p=${a['슬러그'] || ''}`}>{a['제목']}</a>
      {a['설명'] && <p className="ws-scrap-memo">{a['설명']}</p>}
    </li>
  )
}

export default function Collections({ store }) {
  const [marks, setMarks] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')

  const load = useCallback(() => store.interactions.listBookmarked()
    .then((b) => { setMarks(b || []); setStatus('ready') })
    .catch((e) => { setError(e?.message || '불러오기 실패'); setStatus('error') }), [store])

  useEffect(() => { load() }, [load])

  // 공통 프레임(ws-cols): 본문 = 북마크한 인사이트 목록 / 레일 = 사용 안내.
  return (
    <div className="ws-collections ws-cols">
      <div className="ws-cmain">
        <section className="ws-block">
          <h2 className="ws-h2">내 북마크 <span className="ws-count">{marks.length}</span></h2>
          {status === 'loading' && <div className="ws-skel" aria-label="불러오는 중"><span /><span /></div>}
          {error && <p className="ws-error" role="alert">{error}</p>}
          {status === 'ready' && marks.length === 0 && (
            <p className="ws-note">북마크 0건 — 인사이트 상세에서 북마크하면 여기 모인다.</p>
          )}
          <ul className="ws-list">
            {marks.map((m) => <MarkRow key={m.article_id} m={m} />)}
          </ul>
        </section>
      </div>

      <aside className="ws-crail">
        <section className="ws-block">
          <h2 className="ws-h2">안내</h2>
          <p className="ws-note">북마크 추가·해제 = <a href="/insights/">인사이트</a> 상세 화면에서. 여기는 모아 보는 면.</p>
        </section>
      </aside>
    </div>
  )
}
