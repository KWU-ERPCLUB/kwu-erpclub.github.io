// 내정보 > 캘린더 구독 요약(2026-08-18 구독 개인화) — 현재 구독 칩 나열 + 해제만. 추가는 공고 탭에서(오너 확정 §0-8).
// 행 0건 = 기본(학사+AIM) 해석 표시, null = 0014 미적용 강등(안내 한 줄).
import { useCallback, useEffect, useState } from 'react'
import { effectiveSubs, planToggle } from './postings-taxonomy.js'

const label = (s) => (s['분류'] ? `${s['종류']} · ${s['분류']}` : s['종류'] === '학사' ? '학사일정' : s['종류'] === 'AIM' ? 'AIM 일정' : `${s['종류']} 전체`)

export default function MySubscriptions({ store }) {
  const [subs, setSubs] = useState(null)
  const [ready, setReady] = useState(false)
  const [note, setNote] = useState('')

  const load = useCallback(() => store.postings.listSubscriptions()
    .then((s) => { setSubs(s); setReady(true) })
    .catch(() => { setSubs(null); setReady(true) }), [store])

  useEffect(() => { load() }, [load])

  // 해제 — 행 0건(기본 해석) 상태면 planToggle이 나머지 기본 행을 실체화한 뒤 끈다. 실패 = 재조회 원복.
  async function unsubscribe(s) {
    const { writes } = planToggle(subs || [], s['종류'], s['분류'], false)
    try {
      for (const w of writes) await store.postings.toggleSubscription(w['종류'], w['분류'], w.on)
      await load()
    } catch {
      setNote('해제 실패 — 잠시 후 다시')
      setTimeout(() => setNote(''), 3000)
      load()
    }
  }

  const eff = effectiveSubs(subs)
  return (
    <section className="ws-block">
      <h2 className="ws-h2">캘린더 구독 <span className="ws-count">{eff === null ? 0 : eff.length}</span></h2>
      {note && <p className="ws-error" role="status">{note}</p>}
      {ready && eff === null && <p className="ws-note">구독 기능 준비 전(마이그레이션 0014) — 캘린더에는 전 항목이 뜬다.</p>}
      {eff !== null && (
        <>
          <ul className="ws-sub-chips">
            {eff.map((s) => (
              <li key={`${s['종류']}-${s['분류']}`} className="ws-sub-chip">
                {label(s)}
                <button type="button" aria-label={`${label(s)} 구독 해제`} title="구독 해제" onClick={() => unsubscribe(s)}>×</button>
              </li>
            ))}
          </ul>
          {eff.length === 0 && <p className="ws-note">구독 0건 — 캘린더에 과제·세션만 뜬다.</p>}
          <p className="ws-note">구독한 분류의 마감·일정만 홈 캘린더에 합류. 추가는 공고 탭의 각 필터에서.</p>
        </>
      )}
    </section>
  )
}
