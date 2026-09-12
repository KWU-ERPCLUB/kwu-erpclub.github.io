// 회차 준비물 가이드 본체(2026-09-13 역할 3분리: 공지 = 알림 · 과제 = 할 일 · 가이드 = 방법 — 오너 "공지는 서식 하나로, 해야 할 것은 과제로").
// 원천 = data/prep-guides.js(코드). 페이지 = pages/GuidePrep.jsx(/guide/<id>/). 스타일 = styles/guide-prep.css.
// 3차(2026-09-13 오너: "숫자 붙으면 줄 바꿔라, 시간 빼라, 텍스트만 딱딱하다, 시각화") — 화면 요소를 모양으로 그린다:
//   [[버튼]] 버튼 칩 · {{경로 › 경로}} 경로 칩 · <<입력값>> 입력창 · ((키+키)) 키캡 · URL로 시작하는 단계 = 사이트 카드
//   항목 아이콘(단색 선) · 4단계 스테퍼(계정→신청→설치→제출) · 준비물 칩 · 재료 카드 4장
// craft 유지: 좌 목록/우 상세 2열(1100 아래 1열) · 위계 3단 · 포인트 색 = 스테퍼 완료·선택 행·링크 · 검정 채움 = 「완료」 1개
// 완료 상태 = 이 기기 localStorage(`ws-prep:<id>` = boolean[]). 딥링크 = /workspace/?tab=공지&notice=<id>.
import { useEffect, useMemo, useState } from 'react'
import { guideItems } from '../data/prep-guides.js'

// 항목 아이콘 — 단색 선(stroke currentColor). 로고·사진 없이 역할만 표시(디자인규칙 §1·craft R21).
const ICONS = {
  key: <path d="M14 4a6 6 0 1 0 0 12 6 6 0 0 0 0-12zM8.5 9.5 3 15v4h4v-2h2v-2h2l1.5-1.5" />,
  spark: <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM5 17l.8 2.2L8 20l-2.2.8L5 23l-.8-2.2L2 20l2.2-.8z" />,
  folder: <path d="M3 6h6l2 2h10v11H3z" />,
  bot: <path d="M12 3v3M5 9h14v9H5zM9 13h.01M15 13h.01M9 17h6" />,
  window: <path d="M3 5h18v14H3zM3 9h18M7 7h.01M10 7h.01" />,
  note: <path d="M6 3h9l4 4v14H6zM15 3v4h4M9 12h6M9 16h6" />,
  doc: <path d="M5 4h14v16H5zM8 8h8M8 12h8M8 16h5" />,
}
export function Icon({ name }) {
  return (
    <svg className="ws-prep-ico" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ICONS[name] || ICONS.doc}
    </svg>
  )
}

// 문자열 안 표기 → 화면 요소. HTML은 만들지 않는다(React 요소로만).
const TOKEN = /(\[\[[^\]]+\]\]|\{\{[^}]+\}\}|<<[^>]+>>|\(\([^)]+\)\)|\*\*[^*]+\*\*|https?:\/\/[^\s)"'<>]+)/g
export function Inline({ text }) {
  return String(text || '').split(TOKEN).map((p, i) => {
    if (!p) return null
    if (p.startsWith('[[')) return <span key={i} className="ws-ui-btn">{p.slice(2, -2)}</span>
    if (p.startsWith('{{')) {
      const crumbs = p.slice(2, -2).split('›').map((s) => s.trim())
      return <span key={i} className="ws-ui-path">{crumbs.map((c, k) => <span key={k}><span className="ws-ui-crumb">{c}</span>{k < crumbs.length - 1 && <span className="ws-ui-sep" aria-hidden="true">›</span>}</span>)}</span>
    }
    if (p.startsWith('<<')) return <span key={i} className="ws-ui-input">{p.slice(2, -2)}</span>
    if (p.startsWith('((')) return <span key={i} className="ws-ui-keys">{p.slice(2, -2).split('+').map((k, j, a) => <span key={j}><kbd>{k.trim()}</kbd>{j < a.length - 1 && ' + '}</span>)}</span>
    if (/^\*\*[^*]+\*\*$/.test(p)) return <strong key={i}>{p.slice(2, -2)}</strong>
    if (/^https?:\/\//.test(p)) return <a key={i} href={p} target="_blank" rel="noreferrer">{p.replace(/^https?:\/\//, '').replace(/\/$/, '')}</a>
    return p
  })
}

// 단계 한 줄 — URL로 시작하면 사이트 카드 + 나머지 글.
export const splitSite = (s) => { const m = /^(https?:\/\/\S+)\s*(.*)$/.exec(s || ''); return m ? { url: m[1], rest: m[2] } : { url: null, rest: s } }
function Step({ text, no }) {
  const { url, rest } = splitSite(text)
  return (
    <li>
      <span className="ws-prep-step-no" aria-hidden="true">{no}</span>
      <span className="ws-prep-step-text">
        {url && <a className="ws-ui-site" href={url} target="_blank" rel="noreferrer"><span className="ws-ui-site-dom">{url.replace(/^https?:\/\//, '').replace(/\/$/, '').split('/').map((seg, k, a) => <span key={k}>{seg}{k < a.length - 1 && <>/<wbr /></>}</span>)}</span><span className="ws-ui-site-go">열기 ↗</span></a>}
        {rest && <span className="ws-prep-step-rest"><Inline text={rest} /></span>}
      </span>
    </li>
  )
}

const storageKey = (id) => `ws-prep:${id}`
export const readChecks = (id, n) => {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey(id)) || '[]')
    return Array.from({ length: n }, (_, i) => Boolean(saved[i]))
  } catch { return Array.from({ length: n }, () => false) }
}
export const firstOpen = (checks) => { const i = checks.findIndex((c) => !c); return i === -1 ? 0 : i }

// 항목 상세 — 아이콘+제목 · 뭔가요 · 준비물 칩 · 재료 카드 · 단계 · 조건 메모 · 완료 버튼(유일한 채움)
function ItemDetail({ item, index, done, onDone }) {
  return (
    <section className="ws-prep-detail" aria-label={`${index + 1}. ${item.title} 하는 법`}>
      <header className="ws-prep-detail-head">
        <Icon name={item.icon} />
        <h3 className="ws-prep-detail-title">{item.title}</h3>
      </header>
      <p className="ws-prep-what"><Inline text={item.what} /></p>
      {item.need?.length > 0 && (
        <div className="ws-prep-need"><span className="ws-prep-meta">준비물</span>{item.need.map((c) => <span key={c} className="ws-ui-chip">{c}</span>)}</div>
      )}
      {item.cards?.length > 0 && (
        <ol className="ws-prep-cards">
          {item.cards.map((c, k) => <li key={k}><span className="ws-prep-card-no">{k + 1}</span><span className="ws-prep-card-title">{c.title}</span><span className="ws-prep-card-ex">예: {c.example}</span></li>)}
        </ol>
      )}
      <ol className="ws-prep-steps">
        {item.steps.map((s, k) => <Step key={k} text={s} no={k + 1} />)}
      </ol>
      {item.tips?.length > 0 && (
        <ul className="ws-prep-tips">
          {item.tips.map((t, k) => <li key={k}><Inline text={t} /></li>)}
        </ul>
      )}
      <div className="ws-prep-actions">
        <button type="button" className={`ws-prep-done${done ? ' is-undo' : ''}`} onClick={onDone}>
          {done ? '완료 취소' : '완료'}
        </button>
      </div>
    </section>
  )
}

// 4단계 스테퍼 — 묶음별 완료 수. 완료된 묶음 = 채움 점(포인트 색), 진행 중 = 테두리.
function Stepper({ groups, checks, offsets }) {
  return (
    <ol className="ws-prep-stepper" aria-label="진행 단계">
      {groups.map((g, gi) => {
        const total = g.items.length
        const doneN = g.items.reduce((acc, _, k) => acc + (checks[offsets[gi] + k] ? 1 : 0), 0)
        const cls = doneN === total ? 'is-done' : doneN > 0 ? 'is-part' : ''
        return (
          <li key={g.label} className={`ws-prep-step ${cls}`}>
            <span className="ws-prep-step-dot" aria-hidden="true" />
            <span className="ws-prep-step-label">{g.label}</span>
            <span className="ws-prep-meta">{doneN}/{total}</span>
          </li>
        )
      })}
    </ol>
  )
}

// 한 회차 준비물 가이드 본체(2026-09-13 역할 3분리 — 가이드 페이지 /guide/<id>/가 그린다. 공지 탭에는 알림 카드만).
// 상단 = 리드 + 4단계 스테퍼 → 좌 묶음 목록(체크) / 우 상세. 체크 = 기기 저장(과제 탭이 나오면 서버 저장 과제로 이관).
export function PrepGuideBody({ guide }) {
  const items = useMemo(() => guideItems(guide), [guide])
  const offsets = useMemo(() => { let o = 0; return guide.groups.map((g) => { const s = o; o += g.items.length; return s }) }, [guide])
  const n = items.length
  const [checks, setChecks] = useState(() => Array.from({ length: n }, () => false))
  const [sel, setSel] = useState(0)

  useEffect(() => { const c = readChecks(guide.id, n); setChecks(c); setSel(firstOpen(c)) }, [guide.id, n])

  function setCheck(i, value) {
    setChecks((prev) => {
      const next = prev.map((v, k) => (k === i ? value : v))
      try { localStorage.setItem(storageKey(guide.id), JSON.stringify(next)) } catch { /* 저장 불가 = 표시만 */ }
      return next
    })
  }
  function finish(i) {
    const value = !checks[i]
    setCheck(i, value)
    if (value) { const next = checks.map((v, k) => (k === i ? true : v)); setSel(firstOpen(next)) }
  }

  const done = checks.filter(Boolean).length
  const anchor = `prep-${guide.id}`

  return (
    <div className="ws-prep" id={anchor}>
      <header className="ws-prep-head">
        <p className="ws-prep-lead">{guide.lead} <span className="ws-prep-meta">{done}/{n} 완료</span></p>
        <Stepper groups={guide.groups} checks={checks} offsets={offsets} />
      </header>

      <div className="ws-prep-cols">
        <div className="ws-prep-list" role="list" aria-label="준비물 목록">
          {guide.groups.map((g, gi) => (
            <div className="ws-prep-group" key={g.label}>
              <p className="ws-prep-group-label">{g.label}</p>
              {g.items.map((it, k) => {
                const i = offsets[gi] + k
                const active = sel === i
                return (
                  <div key={it.id} className={`ws-prep-item${active ? ' is-active' : ''}${checks[i] ? ' is-done' : ''}`} role="listitem">
                    <div className="ws-prep-rowline">
                      <input type="checkbox" checked={checks[i]} onChange={(e) => setCheck(i, e.target.checked)} aria-label={`${it.title} 완료`} />
                      <button type="button" className="ws-prep-rowbtn" aria-expanded={active} aria-controls={`${anchor}-detail`} onClick={() => setSel(active && !isWide() ? -1 : i)}>
                        <Icon name={it.icon} />
                        <span className="ws-prep-item-title">{it.title}</span>
                      </button>
                    </div>
                    {active && <div className="ws-prep-inline"><ItemDetail item={it} index={i} done={checks[i]} onDone={() => finish(i)} /></div>}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
        <aside className="ws-prep-side" id={`${anchor}-detail`}>
          {sel >= 0 && items[sel] && <ItemDetail item={items[sel]} index={sel} done={checks[sel]} onDone={() => finish(sel)} />}
        </aside>
      </div>

      {guide.note && <p className="ws-prep-note"><Inline text={guide.note} /></p>}
    </div>
  )
}

const isWide = () => typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(min-width: 1100px)').matches
