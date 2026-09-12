// 과제 제출 폼 3종(2026-09-13 과제 탭 신설) — 링크형·폼형·체크리스트형.
// 칸 정의 = data/assignment-forms.js(코드 원천). 저장 = store.submissions.submit({ url | 답변 }).
// 링크 표기 규칙(오너 2026-09-13): 주소를 그대로 보여 주지 않는다. 어디로 가는 링크인지를 글로 쓴다.
import { useState } from 'react'

// 「하는 법」 = 가이드 딥링크. 주소 대신 무엇이 열리는지를 쓴다.
// 체크 행에 7번 반복되므로 기본 라벨은 두 낱말로 짧게 둔다(우측이 붐비면 항목 이름이 안 읽힌다).
export function HowLink({ href, children = '하는 법', tone = 'quiet' }) {
  if (!href) return null
  return <a className={`ws-alink${tone === 'quiet' ? ' quiet' : ''}`} href={href}>{children} →</a>
}

// ── 링크형 ───────────────────────────────────────────────
const isUrl = (v) => /^https?:\/\/\S+$/.test(String(v || '').trim())

export function LinkForm({ row, mine, onSubmit }) {
  const [url, setUrl] = useState(mine?.url || '')
  const [memo, setMemo] = useState(mine?.['메모'] || '')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function send(e) {
    e.preventDefault()
    if (!isUrl(url)) { setError('http로 시작하는 주소를 붙여 넣어 주세요'); return }
    setError('')
    setBusy(true)
    try {
      await onSubmit({ id: mine?.id, assignment_id: row.id, url: url.trim(), 메모: memo })
    } catch (err) {
      setError(err?.message || '제출 실패')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      {/* 제출한 것 = 주소가 아니라 「내가 낸 문서」로 표기(오너 2026-09-13) */}
      {mine?.url && (
        <p className="ws-asubmitted">
          <a className="ws-alink" href={mine.url} target="_blank" rel="noreferrer">내가 낸 문서 열기 ↗</a>
        </p>
      )}
      <form className="ws-aform" onSubmit={send}>
        <label className="ws-field">
          <span>문서 주소</span>
          <input
            value={url} placeholder="구글 문서·노션 링크 붙여 넣기" aria-label={`${row['제목']} 제출 링크`}
            onChange={(e) => setUrl(e.target.value)}
          />
        </label>
        <label className="ws-field">
          <span>메모(선택)</span>
          <input value={memo} aria-label={`${row['제목']} 제출 메모`} onChange={(e) => setMemo(e.target.value)} />
        </label>
        {error && <p className="ws-error" role="alert">{error}</p>}
        <button type="submit" className="ws-submit" disabled={busy}>{mine ? '다시 제출' : '제출'}</button>
      </form>
    </>
  )
}

// ── 폼형 ─────────────────────────────────────────────────
export function FieldForm({ row, form, mine, onSubmit }) {
  const [values, setValues] = useState(() => Object.fromEntries(form.fields.map((f) => [f.key, mine?.['답변']?.[f.key] || ''])))
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const set = (key, v) => setValues((prev) => ({ ...prev, [key]: v }))

  async function send(e) {
    e.preventDefault()
    const filled = form.fields.filter((f) => String(values[f.key] || '').trim() !== '')
    if (filled.length === 0) { setError('한 칸 이상 적어 주세요'); return }
    setError('')
    setBusy(true)
    try {
      await onSubmit({ id: mine?.id, assignment_id: row.id, 답변: values })
    } catch (err) {
      setError(err?.message || '제출 실패')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="ws-aform ws-aform-fields" onSubmit={send}>
      {form.fields.map((f, i) => (
        <label className="ws-field ws-afield" key={f.key}>
          <span><i className="ws-afield-no" aria-hidden="true">{i + 1}</i>{f.label}</span>
          {f.multiline
            ? <textarea className="ws-textarea" rows={2} value={values[f.key]} placeholder={f.hint} onChange={(e) => set(f.key, e.target.value)} />
            : <input value={values[f.key]} placeholder={f.hint} onChange={(e) => set(f.key, e.target.value)} />}
        </label>
      ))}
      {error && <p className="ws-error" role="alert">{error}</p>}
      <div className="ws-aform-acts">
        <button type="submit" className="ws-submit" disabled={busy}>{mine ? '다시 제출' : '제출'}</button>
        <HowLink href={form.가이드} tone="loud">적는 법 보기</HowLink>
      </div>
    </form>
  )
}

// ── 체크리스트형 ─────────────────────────────────────────
// 묶음 스테퍼 + 항목 체크. 체크할 때마다 바로 저장한다(제출 버튼 없음 — 준비물은 며칠에 걸쳐 하나씩 끝낸다).
// 2026-09-13 2차(오너: "왼쪽으로 쏠렸다 · 하는 법이 7번 반복된다 · 서식·색·움직임이 적다"):
//   묶음을 2열 격자로 펴서 카드 폭을 채우고, 「하는 법」은 카드당 1개로 합치고,
//   진행은 스테퍼 선 채움 + 막대 + 묶음 완료 표시로 보여 준다(움직임 = 상태가 변할 때만, 진입 애니메이션 없음).
export function ChecklistStepper({ form, answer }) {
  const total = form.items.length
  const done = form.items.filter((it) => answer[it.key] === true).length
  return (
    <div className="ws-astep-wrap">
      <ol className="ws-astep" aria-label="진행 단계">
        {form.groups.map((label) => {
          const items = form.items.filter((it) => it.group === label)
          const n = items.filter((it) => answer[it.key] === true).length
          const cls = n === items.length ? 'is-done' : n > 0 ? 'is-part' : ''
          return (
            <li key={label} className={`ws-astep-i ${cls}`}>
              <span className="ws-astep-dot" aria-hidden="true" />
              <span className="ws-astep-label">{label}</span>
              <span className="ws-astep-n">{n}/{items.length}</span>
            </li>
          )
        })}
      </ol>
      <div className="ws-aprog">
        <span className="ws-aprog-bar" aria-hidden="true">
          <i style={{ width: `${total ? (done / total) * 100 : 0}%` }} />
        </span>
        <span className="ws-aprog-n">{done}<em>/{total}</em> 완료</span>
      </div>
    </div>
  )
}

export function ChecklistForm({ row, form, mine, onSubmit }) {
  const [answer, setAnswer] = useState(() => ({ ...mine?.['답변'] }))
  const [error, setError] = useState('')

  async function toggle(key, on) {
    const next = { ...answer, [key]: on }
    setAnswer(next)
    setError('')
    try {
      await onSubmit({ id: mine?.id, assignment_id: row.id, 답변: next })
    } catch (err) {
      setAnswer(answer)   // 저장 실패 = 화면도 되돌린다(유령 체크 금지)
      setError(err?.message || '저장 실패. 잠시 후 다시')
    }
  }

  return (
    <div className="ws-achecklist">
      <ChecklistStepper form={form} answer={answer} />
      {/* 묶음 = 2열 격자(1100 아래 1열). 카드가 넓어져도 한 줄이 길어지지 않는다 */}
      <div className="ws-acheck-cols">
        {form.groups.map((label) => {
          const items = form.items.filter((it) => it.group === label)
          const n = items.filter((it) => answer[it.key] === true).length
          return (
            <section className={`ws-acheck-group${n === items.length ? ' is-done' : ''}`} key={label}>
              <p className="ws-acheck-glabel">
                {label}<span className="ws-acheck-gn">{n}/{items.length}</span>
              </p>
              <ul className="ws-acheck-list">
                {items.map((it) => (
                  <li key={it.key} className={`ws-acheck${answer[it.key] ? ' is-done' : ''}`}>
                    <label>
                      <input type="checkbox" checked={Boolean(answer[it.key])} onChange={(e) => toggle(it.key, e.target.checked)} />
                      <span className="ws-acheck-box" aria-hidden="true" />
                      <span className="ws-acheck-label">{it.label}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </section>
          )
        })}
      </div>
      {error && <p className="ws-error" role="alert">{error}</p>}
      {/* 「하는 법」 = 카드당 1개(오너 2026-09-13 — 행마다 같은 글자가 7번 반복돼 소음이었다) */}
      <div className="ws-acheck-foot">
        <p className="ws-anote">체크하면 바로 저장된다.</p>
        <HowLink href={form.가이드} tone="loud">하는 법 전체 보기</HowLink>
      </div>
    </div>
  )
}
