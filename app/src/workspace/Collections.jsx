// 워크스페이스 컬렉션 탭(SPEC §0-9) — ①내 북마크(공개 기사) ②링크 스크랩 CRUD.
// 스크랩은 본인만 읽고 쓴다(RLS collections_own). 정크 허용 = 품질 게이트 없음.
import { useCallback, useEffect, useState } from 'react'

const isUrl = (v) => /^https?:\/\/\S+$/.test(String(v || '').trim())

// 스크랩 1행 — 보기 모드 ↔ 수정 모드.
function ScrapRow({ row, onSave, onRemove }) {
  const [edit, setEdit] = useState(false)
  const [url, setUrl] = useState(row.url)
  const [memo, setMemo] = useState(row['메모'] || '')
  if (!edit) {
    return (
      <li className="ws-scrap">
        <a className="ws-scrap-url" href={row.url} target="_blank" rel="noreferrer">{row.url}</a>
        {row['메모'] && <p className="ws-scrap-memo">{row['메모']}</p>}
        <div className="ws-row-acts">
          <button type="button" onClick={() => setEdit(true)}>수정</button>
          <button type="button" onClick={() => onRemove(row.id)}>삭제</button>
        </div>
      </li>
    )
  }
  return (
    <li className="ws-scrap">
      <input className="ws-inline" value={url} aria-label="링크 주소" onChange={(e) => setUrl(e.target.value)} />
      <input className="ws-inline" value={memo} aria-label="메모" placeholder="메모(선택)" onChange={(e) => setMemo(e.target.value)} />
      <div className="ws-row-acts">
        <button
          type="button"
          onClick={() => { if (isUrl(url)) { onSave(row.id, { url: url.trim(), 메모: memo }); setEdit(false) } }}
        >
          저장
        </button>
        <button type="button" onClick={() => { setUrl(row.url); setMemo(row['메모'] || ''); setEdit(false) }}>취소</button>
      </div>
    </li>
  )
}

export default function Collections({ store }) {
  const [scraps, setScraps] = useState([])
  const [marks, setMarks] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const [url, setUrl] = useState('')
  const [memo, setMemo] = useState('')

  const load = useCallback(() => {
    setStatus('loading')
    return Promise.all([store.collections.listMine(), store.interactions.listBookmarked()])
      .then(([c, b]) => { setScraps(c || []); setMarks(b || []); setStatus('ready') })
      .catch((e) => { setError(e?.message || '불러오기 실패'); setStatus('error') })
  }, [store])

  useEffect(() => { load() }, [load])

  async function add(e) {
    e.preventDefault()
    if (!isUrl(url)) return setError('http(s)로 시작하는 주소 입력')
    setError('')
    try {
      const row = await store.collections.add({ url: url.trim(), 메모: memo })
      setScraps((list) => [row, ...list])
      setUrl('')
      setMemo('')
    } catch (err) {
      setError(err?.message || '저장 실패')
    }
    return undefined
  }

  async function save(id, patch) {
    try {
      const row = await store.collections.update(id, patch)
      setScraps((list) => list.map((c) => (c.id === id ? { ...c, ...row } : c)))
    } catch (err) { setError(err?.message || '수정 실패') }
  }

  async function remove(id) {
    try {
      await store.collections.remove(id)
      setScraps((list) => list.filter((c) => c.id !== id))
    } catch (err) { setError(err?.message || '삭제 실패') }
  }

  // 공통 프레임(ws-cols): 본문 = 링크 스크랩(CRUD) / 레일 = 내 북마크(읽기 목록).
  return (
    <div className="ws-collections ws-cols">
      <div className="ws-cmain">
      <section className="ws-block">
        <h2 className="ws-h2">링크 스크랩</h2>
        <form className="ws-scrap-form" onSubmit={add}>
          <input
            className="ws-inline" value={url} placeholder="https://..." aria-label="스크랩 링크"
            onChange={(e) => setUrl(e.target.value)}
          />
          <input
            className="ws-inline" value={memo} placeholder="메모(선택)" aria-label="스크랩 메모"
            onChange={(e) => setMemo(e.target.value)}
          />
          <button type="submit" className="ws-submit ws-submit-inline">추가</button>
        </form>
        {error && <p className="ws-error" role="alert">{error}</p>}
        {status === 'ready' && scraps.length === 0 && <p className="ws-note">스크랩 0건 — 위에 주소 입력.</p>}
        <ul className="ws-list">
          {scraps.map((row) => <ScrapRow key={row.id} row={row} onSave={save} onRemove={remove} />)}
        </ul>
      </section>
      </div>

      <aside className="ws-crail">
        <section className="ws-block">
          <h2 className="ws-h2">내 북마크</h2>
          {status === 'loading' && <div className="ws-skel" aria-label="불러오는 중"><span /><span /></div>}
          {status === 'ready' && marks.length === 0 && <p className="ws-note">북마크 0건 — 인사이트 상세에서 추가.</p>}
          <ul className="ws-list">
            {marks.map((m) => (
              <li key={m.article_id} className="ws-mark">
                <a href={`/insights/?p=${m.articles?.['슬러그'] || ''}`}>{m.articles?.['제목'] || '(삭제된 기사)'}</a>
                <span className="ws-mark-meta">{m.articles?.['게재일'] || ''}</span>
              </li>
            ))}
          </ul>
        </section>
      </aside>
    </div>
  )
}
