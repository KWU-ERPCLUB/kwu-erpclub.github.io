// 북마크 섹션(2026-08-14 오너 재편) — 단독 탭 폐지, 내정보 탭 안의 섹션으로 흡수.
// 표시 = 인사이트 축소판: 정사각 카드 그리드(위 = 썸네일 ∨ 성격색 타일, 아래 = 제목). 클릭 = 공개 상세.
// (collections 데이터 계층·테이블은 유지. 북마크 추가·해제 = 공개 인사이트 상세에서 — 여기는 읽기 전용.)
import { useCallback, useEffect, useState } from 'react'

// 성격 4색(디자인규칙 §1 파생 토큰과 동일 값) — 이미지 없는 기사 폴백 타일 배경/전경.
const KIND_TINT = {
  트렌드: ['#E5F0FB', '#38618C'],
  '심층 분석': ['#FAF0E1', '#6F5227'],
  '활용법·튜토리얼': ['#E4F3E8', '#39734A'],
  '도구·프롬프트': ['#EEE9FA', '#63549E'],
}

function MarkCard({ m }) {
  const a = m.articles
  if (!a) {
    return <li className="ws-markcard is-gone"><span className="ws-mark-meta">(삭제된 기사)</span></li>
  }
  const [bg, fg] = KIND_TINT[a['성격']] || ['#f1f0ee', '#55606c']
  return (
    <li className="ws-markcard">
      <a href={`/insights/?p=${a['슬러그'] || ''}`} aria-label={a['제목']}>
        <span className="ws-markcard-thumb" style={a['이미지'] ? undefined : { background: bg, color: fg }}>
          {a['이미지']
            ? <img src={a['이미지']} alt="" loading="lazy" />
            : <span className="ws-markcard-kind">{a['성격'] || '인사이트'}</span>}
        </span>
        <span className="ws-markcard-title">{a['제목']}</span>
      </a>
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

  return (
    <section className="ws-block ws-collections">
      <h2 className="ws-h2">내 북마크 <span className="ws-count">{marks.length}</span></h2>
      {status === 'loading' && <div className="ws-skel" aria-label="불러오는 중"><span /><span /></div>}
      {error && <p className="ws-error" role="alert">{error}</p>}
      {status === 'ready' && marks.length === 0 && (
        <p className="ws-note">북마크 0건 — <a href="/insights/">인사이트</a> 상세에서 북마크하면 여기 모인다.</p>
      )}
      <ul className="ws-marks">
        {marks.map((m) => <MarkCard key={m.article_id} m={m} />)}
      </ul>
    </section>
  )
}
