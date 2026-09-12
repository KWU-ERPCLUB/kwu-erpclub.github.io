// 운영 탭 — 공지·세션·자료·과제 등록/수정(M3 ②). 폼 뼈대 = AdminForm, 여기는 필드 정의와 로딩만.
// 자료는 링크(url)만 — 파일 업로드는 M4(Storage 버킷 미생성).
import { useCallback, useEffect, useState } from 'react'
import AdminForm from './AdminForm.jsx'
import { FORM_OPTIONS, KINDS } from '../data/assignment-forms.js'

// 과제 양식(입력 칸)은 코드가 원천 — 여기서는 목록에서 고르기만 한다(오너 픽 2026-09-13, 0025).
const KIND_OPTIONS = KINDS.map((k) => ({ value: k, label: k }))
const FORM_KEY_OPTIONS = FORM_OPTIONS.map((f) => ({ value: f.key, label: `${f.이름} (${f.종류})` }))

const FIELDS = {
  notices: [['제목', 'text'], ['본문', 'textarea'], ['내부여부', 'check']],
  sessions: [['회차', 'number'], ['날짜', 'date'], ['제목', 'text'], ['설명', 'text']],
  materials: [['session_id', 'session'], ['제목', 'text'], ['url', 'text'], ['공개일', 'date']],
  notes: [['session_id', 'session'], ['본문', 'textarea'], ['공개일', 'date']],
  assignments: [
    ['session_id', 'session'], ['제목', 'text'], ['설명', 'text'], ['마감', 'datetime'],
    ['종류', 'select', KIND_OPTIONS], ['양식키', 'select', FORM_KEY_OPTIONS],
  ],
}

export default function AdminContent({ store }) {
  const [data, setData] = useState({ notices: [], sessions: [], materials: [], notes: [], assignments: [] })
  const [error, setError] = useState('')

  const load = useCallback(() => Promise.all([
    store.notices.listInternal(),
    store.sessions.list(),
    store.materials.list(),
    store.notes.list(),
    store.assignments.list(),
  ]).then(([notices, sessions, materials, notes, assignments]) => setData({
    notices: notices || [], sessions: sessions || [], materials: materials || [], notes: notes || [], assignments: assignments || [],
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
        title="세션 본문(회차 상세 — 목표·진행)" fields={FIELDS.notes} rows={data.notes} sessions={data.sessions}
        onSave={saver('notes')} labelOf={(n) => `${(n['본문'] || '').slice(0, 24)}… · ${n['공개일'] || '즉시 공개'}`}
      />
      <AdminForm
        title="과제(종류 = 링크·폼·체크리스트, 양식은 코드 목록에서 선택)"
        fields={FIELDS.assignments} rows={data.assignments} sessions={data.sessions}
        onSave={saver('assignments')}
        labelOf={(a) => `${a['제목']} · ${a['종류'] || '링크'} · ${a['마감'] || '마감 없음'}`}
      />
    </div>
  )
}
