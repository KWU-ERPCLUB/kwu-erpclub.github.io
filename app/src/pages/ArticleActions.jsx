// 기사 상세 상호작용 줄 — 북마크·좋아요(SPEC §3 D3: 열람=공개, 상호작용=로그인 멤버).
// 비로그인 = 총계만 보이고 버튼은 눌러진 상태가 되지 않는다(클릭 = 워크스페이스 안내 문구).
// 백엔드 미설정(md 폴백)에서는 부모가 이 컴포넌트를 아예 렌더하지 않는다 — 죽은 버튼 금지.

function Heart() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 13.5S1.8 9.9 1.8 5.9A3.1 3.1 0 0 1 8 4.3a3.1 3.1 0 0 1 6.2 1.6c0 4-6.2 7.6-6.2 7.6Z"
        stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  )
}

function Mark() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M4 2.5h8v11l-4-3-4 3v-11Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  )
}

export default function ArticleActions({ articleId, api }) {
  if (!api?.enabled || !articleId) return null
  const c = api.countsOf(articleId)
  const liked = api.liked(articleId)
  const marked = api.bookmarked(articleId)
  return (
    <div className="art-actions">
      <button
        type="button" className={`art-act${liked ? ' on' : ''}`} aria-pressed={liked}
        onClick={() => api.toggle('like', articleId)}
      >
        <Heart /> <span>좋아요</span> <b>{c['좋아요수'] || 0}</b>
      </button>
      <button
        type="button" className={`art-act${marked ? ' on' : ''}`} aria-pressed={marked}
        onClick={() => api.toggle('bookmark', articleId)}
      >
        <Mark /> <span>북마크</span> <b>{c['북마크수'] || 0}</b>
      </button>
      {api.notice && <p className="art-act-note" role="status">{api.notice}</p>}
    </div>
  )
}
