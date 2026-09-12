// 회차 준비물 고정 공지(2026-09-12 오너: "공지 탭 안에 만들고, 로드맵에서 열면 그 공지로 이동").
// 원천 = data/prep-guides.js(코드) — DB 공지가 아니다. 긴 단계 안내는 코드 화면이어야 미리보기·버전·디자인이 따라온다.
// 2차 재구성(오너 재지적 "비율이 비고 검정 텍스트만 빽빽, 흐름이 안 보임") — craft 결정지도 적용:
//   · 좌 목록 / 우 상세 2열(R23 텍스트 좌 · D1 도구형은 주 액션부터) — 1100px 아래는 1열 아코디언
//   · 위계 3단(R4): 제목 1.35rem / 행·본문 1rem / 메타 0.78rem. 행 제목 500(굵기 내림), 검정 원·pill 버튼 삭제(R20·R7)
//   · 포인트 색 예산(D4): 진행 막대 + 선택 행 좌측 바 + 단계 안 링크. 검정 채움 = 「끝냄」 버튼 1개
//   · 묶음 4개(계정·신청·설치·제출) = R26 리듬, 그룹 간격 ↑ 요소 간격 ↓(R76)
// 체크 상태 = 이 기기 localStorage(`ws-prep:<id>` = boolean[]). 딥링크 = /workspace/?tab=공지&notice=<id>.
import { useEffect, useMemo, useState } from 'react'
import { guideItems } from '../data/prep-guides.js'

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
// 다음에 볼 항목 = 첫 미완료(전부 완료면 첫 항목). 순수(테스트 대상).
export const firstOpen = (checks) => { const i = checks.findIndex((c) => !c); return i === -1 ? 0 : i }

// 항목 상세 — 제목 · 뭔가요(정의 2문장) · 준비물 · 단계(큰 회색 번호) · 조건 메모 · 끝냄 버튼(화면의 유일한 채움 버튼)
function ItemDetail({ item, index, done, onDone }) {
  return (
    <section className="ws-prep-detail" aria-label={`${index + 1}. ${item.title} 하는 법`}>
      <header className="ws-prep-detail-head">
        <h3 className="ws-prep-detail-title">{item.title}</h3>
        <span className="ws-prep-meta">{item.minutes}분</span>
      </header>
      <p className="ws-prep-what"><Inline text={item.what} /></p>
      {item.need && <p className="ws-prep-need"><span className="ws-prep-meta">준비물</span> <Inline text={item.need} /></p>}
      <ol className="ws-prep-steps">
        {item.steps.map((s, k) => <li key={k}><span className="ws-prep-step-no" aria-hidden="true">{k + 1}</span><span className="ws-prep-step-text"><Inline text={s} /></span></li>)}
      </ol>
      {item.tips?.length > 0 && (
        <ul className="ws-prep-tips">
          {item.tips.map((t, k) => <li key={k}><Inline text={t} /></li>)}
        </ul>
      )}
      <div className="ws-prep-actions">
        <button type="button" className={`ws-prep-done${done ? ' is-undo' : ''}`} onClick={onDone}>
          {done ? '끝냄 취소' : '이 항목 끝냄'}
        </button>
      </div>
    </section>
  )
}

// 한 회차 준비물 = 공지 목록의 행 1개(📌 고정). 펼침 = 머리(제목·리드·진행) → 좌 묶음 목록 / 우 상세.
export function PrepGuide({ guide, openInitially = false }) {
  const items = useMemo(() => guideItems(guide), [guide])
  const n = items.length
  const [checks, setChecks] = useState(() => Array.from({ length: n }, () => false))
  const [open, setOpen] = useState(openInitially)
  const [sel, setSel] = useState(0)

  // 저장값은 마운트 후 읽는다(SSR·테스트 = 전부 false). 처음 보는 항목 = 첫 미완료.
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
  let idx = -1

  return (
    <li className="ws-notice-row ws-prep-row" id={anchor}>
      <details open={open} onToggle={(e) => setOpen(e.currentTarget.open)}>
        <summary className="ws-notice-sum">
          <span className="ws-prep-pin" aria-label="고정 공지">📌</span>
          <span className="ws-notice-title">{guide.title}</span>
          <span className="ws-prep-meta">{done}/{n}</span>
          <span className="ws-notice-when">{guide.date}</span>
        </summary>
        <div className="ws-prep">
          <header className="ws-prep-head">
            {/* 제목은 접힘 행(summary)이 이미 담당 — 펼침 머리에는 리드·진행만(제목 2회 노출 방지) */}
            <p className="ws-prep-lead">{guide.lead}</p>
            <div className="ws-prep-progress" role="progressbar" aria-valuemin={0} aria-valuemax={n} aria-valuenow={done} aria-label="준비 진행">
              <span className="ws-prep-bar" style={{ width: `${(done / n) * 100}%` }} />
            </div>
            <p className="ws-prep-meta ws-prep-count">{done} / {n} 끝냄</p>
          </header>

          <div className="ws-prep-cols">
            <div className="ws-prep-list" role="list" aria-label="준비물 목록">
              {guide.groups.map((g) => (
                <div className="ws-prep-group" key={g.label}>
                  <p className="ws-prep-group-label">{g.label}</p>
                  {g.items.map((it) => {
                    idx += 1
                    const i = idx
                    const active = sel === i
                    return (
                      <div key={it.id} className={`ws-prep-item${active ? ' is-active' : ''}${checks[i] ? ' is-done' : ''}`} role="listitem">
                        <div className="ws-prep-rowline">
                          <input type="checkbox" checked={checks[i]} onChange={(e) => setCheck(i, e.target.checked)} aria-label={`${it.title} 끝냄`} />
                          <button type="button" className="ws-prep-rowbtn" aria-expanded={active} aria-controls={`${anchor}-detail`} onClick={() => setSel(active && !isWide() ? -1 : i)}>
                            <span className="ws-prep-no">{i + 1}</span>
                            <span className="ws-prep-item-title">{it.title}</span>
                            <span className="ws-prep-meta">{it.minutes}분</span>
                          </button>
                        </div>
                        {/* 1열(1100px 아래)일 때만 행 아래 상세 — CSS가 표시를 가른다 */}
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
      </details>
    </li>
  )
}

// 2열 여부(1100px 이상) — 1열에서는 같은 행을 다시 누르면 접힌다.
const isWide = () => typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(min-width: 1100px)').matches

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
