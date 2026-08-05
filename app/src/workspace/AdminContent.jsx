// 운영 탭 — 공지·세션·자료·과제 등록/수정(M3 ②). 폼 뼈대 = AdminForm, 여기는 필드 정의와 로딩만.
// 자료는 링크(url)만 — 파일 업로드는 M4(Storage 버킷 미생성).
import { useCallback, useEffect, useState } from 'react'
import AdminForm from './AdminForm.jsx'

const FIELDS = {
  notices: [['제목', 'text'], ['본문', 'textarea'], ['내부여부', 'check']],
  sessions: [['회차', 'number'], ['날짜', 'date'], ['제목', 'text'], ['설명', 'text']],
  materials: [['session_id', 'session'], ['제목', 'text'], ['url', 'text']],
  assignments: [['session_id', 'session'], ['제목', 'text'], ['설명', 'text'], ['마감', 'datetime']],
}

export default function AdminContent({ store }) {
  const [data, setData] = useState({ notices: [], sessions: [], materials: [], assignments: [] })
  const [error, setError] = useState('')

  const load = useCallback(() => Promise.all([
    store.notices.listInternal(),
    store.sessions.list(),
    store.materials.list(),
    store.assignments.list(),
  ]).then(([notices, sessions, materials, assignments]) => setData({
    notices: notices || [], sessions: sessions || [], materials: materials || [], assignments: assignments || [],
  })).catch((e) => setError(e?.message || '불러오기 실패')), [store])

  useEffect(() => { load() }, [load])

  const saver = (domain) => async (row) => {
    await store[domain].save(row)
    await load()
  }

  return (
    <div className="ws-admin-content">
      {error && <p className="ws-error" role="alert">{error}</p>}
      <AdminForm
        title="공지" fields={FIELDS.notices} rows={data.notices} onSave={saver('notices')}
        labelOf={(n) => `${n['제목']} · ${n['내부여부'] === false ? '공개' : '내부'}`}
      />
      <AdminForm
        title="세션" fields={FIELDS.sessions} rows={data.sessions} onSave={saver('sessions')}
        labelOf={(s) => `${s['회차']}회차 · ${s['제목']} · ${s['날짜'] || '일정 미정'}`}
      />
      <AdminForm
        title="세션 자료(링크)" fields={FIELDS.materials} rows={data.materials} sessions={data.sessions}
        onSave={saver('materials')} labelOf={(m) => `${m['제목']} · ${m.url || '파일'}`}
      />
      <AdminForm
        title="과제" fields={FIELDS.assignments} rows={data.assignments} sessions={data.sessions}
        onSave={saver('assignments')} labelOf={(a) => `${a['제목']} · ${a['마감'] || '마감 없음'}`}
      />
    </div>
  )
}
