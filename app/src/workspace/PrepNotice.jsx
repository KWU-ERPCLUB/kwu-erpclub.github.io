// 회차 준비물 고정 공지(2026-09-12 오너: "공지 탭 안에 만들고, 로드맵에서 열면 그 공지로 이동").
// 원천 = data/prep-guides.js(코드) — DB 공지가 아니다. 이유: 긴 단계 안내는 SQL로 넣으면 미리보기·버전 관리가 없고,
// 공지 8건으로 쪼개면 목록에서 어느 공지가 어느 회차 것인지 구분이 안 된다(오너 지적). 한 공지 안에 체크리스트 + 항목별 접힘.
// 체크 상태 = 이 기기 localStorage(`ws-prep:<id>` = boolean[]). 서버 저장 없음(개인 진행 표시용).
// 딥링크 = /workspace/?tab=공지&notice=<id> → 그 공지를 펼치고 스크롤(로드맵 탭 회차 카드가 이 주소로 보낸다).
import { useEffect, useMemo, useState } from 'react'

// 문자열 안 마크업 2종만 — **굵게** · http(s) URL 자동 링크. HTML은 만들지 않는다(React 요소로만).
export function Inline({ text }) {
  const parts = String(text || '').split(/(\*\*[^*]+\*\*|https?:\/\/[^\s)"'<>]+)/g)
  return parts.map((p, i) => {
    if (/^\*\*[^*]+\*\*$/.test(p)) return <strong key={i}>{p.slice(2, -2)}</strong>
    if (/^https?:\/\//.test(p)) return <a key={i} href={p} target="_blank" rel="noreferrer">{p.replace(/^https?:\/\//, '').replace(/\/$/, '')}</a>
    return p
  })
}

const storageKey = (id) => `ws-prep:${id}`
export const readChecks = (id, n) => {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey(id)) || '[]')
    return Array.from({ length: n }, (_, i) => Boolean(saved[i]))
  } catch { return Array.from({ length: n }, () => false) }
}

export const noticeParam = (search) => new URLSearchParams(search || '').get('notice')

// 한 회차 준비물 = 공지 목록의 행 1개(📌 고정). 펼치면 소개 → 체크리스트 → 항목별 접힘(이게 뭔가요 · 준비물 · 단계 · 메모) → 메모.
export function PrepGuide({ guide, openInitially = false }) {
  const n = guide.items.length
  const [checks, setChecks] = useState(() => Array.from({ length: n }, () => false))
  const [open, setOpen] = useState(openInitially)
  const [item, setItem] = useState(null)

  // 저장값은 마운트 후 읽는다(SSR·테스트 = 전부 false).
  useEffect(() => { setChecks(readChecks(guide.id, n)) }, [guide.id, n])

  function toggle(i) {
    setChecks((prev) => {
      const next = prev.map((v, k) => (k === i ? !v : v))
      try { localStorage.setItem(storageKey(guide.id), JSON.stringify(next)) } catch { /* 저장 불가 = 표시만 */ }
      return next
    })
  }

  const done = checks.filter(Boolean).length
  const anchor = `prep-${guide.id}`

  return (
    <li className="ws-notice-row ws-prep-row" id={anchor}>
      <details open={open} onToggle={(e) => setOpen(e.currentTarget.open)}>
        <summary className="ws-notice-sum">
          <span className="ws-prep-pin" aria-label="고정 공지">📌</span>
          <span className="ws-notice-title">{guide.title}</span>
          <span className="ws-prep-progress" aria-label={`완료 ${done} / ${n}`}>{done}/{n}</span>
          <span className="ws-notice-when">{guide.date}</span>
        </summary>
        <div className="ws-notice-body ws-prep">
          <p>{guide.intro}</p>

          <ol className="ws-prep-list" aria-label="체크리스트">
            {guide.items.map((it, i) => (
              <li key={it.id} className={`ws-prep-check${checks[i] ? ' is-done' : ''}`}>
                <label>
                  <input type="checkbox" checked={checks[i]} onChange={() => toggle(i)} />
                  <span className="ws-prep-check-no">{i + 1}</span>
                  <span className="ws-prep-check-title">{it.title}</span>
                  <span className="ws-prep-min">{it.minutes}분</span>
                </label>
                <button type="button" className="ws-prep-how" aria-expanded={item === it.id} onClick={() => setItem(item === it.id ? null : it.id)}>
                  {item === it.id ? '닫기' : '하는 법'}
                </button>
              </li>
            ))}
          </ol>

          {guide.items.map((it, i) => item === it.id && (
            <section key={it.id} className="ws-prep-item" aria-label={`${i + 1}. ${it.title} 하는 법`}>
              <h3 className="ws-prep-item-title"><span className="ws-prep-check-no">{i + 1}</span>{it.title} <span className="ws-prep-min">{it.minutes}분</span></h3>
              <p className="ws-prep-what"><strong>이게 뭔가요</strong> <Inline text={it.what} /></p>
              {it.need && <p className="ws-prep-need"><strong>준비물</strong> <Inline text={it.need} /></p>}
              <ol className="ws-prep-steps">
                {it.steps.map((s, k) => <li key={k}><Inline text={s} /></li>)}
              </ol>
              {it.tip && <p className="ws-prep-tip"><Inline text={it.tip} /></p>}
              <p className="ws-prep-done-row">
                <label><input type="checkbox" checked={checks[i]} onChange={() => toggle(i)} /> 이 항목 끝냄</label>
              </p>
            </section>
          ))}

          {guide.note && <p className="ws-prep-note"><Inline text={guide.note} /></p>}
        </div>
      </details>
    </li>
  )
}

// 공지 목록 상단에 고정 공지들을 렌더. `?notice=<id>`로 들어오면 그 공지를 펼치고 스크롤.
export default function PrepNotices({ guides, search }) {
  const target = useMemo(() => noticeParam(search ?? (typeof window !== 'undefined' ? window.location.search : '')), [search])
  useEffect(() => {
    if (!target || typeof document === 'undefined') return
    const el = document.getElementById(`prep-${target}`)
    if (el) el.scrollIntoView({ block: 'start' })
  }, [target])
  if (!guides || guides.length === 0) return null
  return guides.map((g) => <PrepGuide key={g.id} guide={g} openInitially={target === g.id} />)
}
