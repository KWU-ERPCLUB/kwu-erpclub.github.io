// 내정보 > 내 캘린더(2026-08-18 구독 개인화) — 캘린더에 등록한 분류 칩 나열 + 해제만. 등록은 공고 탭에서(오너 확정 §0-8).
// 행 0건 = 기본(학사+AIM) 해석 표시, null = 0014 미적용 강등(안내 한 줄).
// 카피 = "캘린더에 등록"(오너 2026-08-18 2차 — '구독'·'담기' 모두 비직관 판정). 변경은 SUBS_CHANGED로 홈에 즉시 반영.
import { useCallback, useEffect, useState } from 'react'
import { effectiveSubs, planToggle, SUBS_CHANGED } from './postings-taxonomy.js'
import { kindClass, categoryLabel, CATEGORY_LABEL } from './kind-colors.js'

// 표시명 원천 = kind-colors(캘린더 범례·공고 탭 칩과 같은 표기). 세부 분류가 있으면 '종류 · 분류'.
const label = (s) => (s['분류'] ? `${s['종류']} · ${s['분류']}` : CATEGORY_LABEL[s['종류']] ? categoryLabel(s['종류']) : `${s['종류']} 전체`)

export default function MySubscriptions({ store }) {
  const [subs, setSubs] = useState(null)
  const [ready, setReady] = useState(false)
  const [note, setNote] = useState('')

  const load = useCallback(() => store.postings.listSubscriptions()
    .then((s) => { setSubs(s); setReady(true) })
    .catch(() => { setSubs(null); setReady(true) }), [store])

  useEffect(() => { load() }, [load])

  // 공고 탭 토글 즉시 반영 — 탭이 hidden 보존이라 이벤트로 동기화(2026-08-18).
  useEffect(() => {
    window.addEventListener(SUBS_CHANGED, load)
    return () => window.removeEventListener(SUBS_CHANGED, load)
  }, [load])

  // 해제 — 행 0건(기본 해석) 상태면 planToggle이 나머지 기본 행을 실체화한 뒤 끈다. 실패 = 재조회 원복.
  async function remove(s) {
    const { writes } = planToggle(subs || [], s['종류'], s['분류'], false)
    try {
      for (const w of writes) await store.postings.toggleSubscription(w['종류'], w['분류'], w.on)
      await load()
      window.dispatchEvent(new Event(SUBS_CHANGED))   // 홈 캘린더·공고 탭 즉시 반영
    } catch {
      setNote('해제 실패 — 잠시 후 다시')
      setTimeout(() => setNote(''), 3000)
      load()
    }
  }

  const eff = effectiveSubs(subs)
  return (
    <section className="ws-block">
      <h2 className="ws-h2">캘린더에 등록한 분류 <span className="ws-count">{eff === null ? 0 : eff.length}</span></h2>
      {note && <p className="ws-error" role="status">{note}</p>}
      {ready && eff === null && <p className="ws-note">등록 기능 준비 전(마이그레이션 0014) — 캘린더에는 전 항목이 뜬다.</p>}
      {eff !== null && (
        <>
          <ul className="ws-sub-chips">
            {eff.map((s) => (
              <li key={`${s['종류']}-${s['분류']}`} className="ws-sub-chip">
                <span className={`ws-cal-dot ${kindClass(s['종류'])}`} aria-hidden="true" />
                {label(s)}
                <button type="button" aria-label={`${label(s)} 등록 해제`} title="등록 해제" onClick={() => remove(s)}>×</button>
              </li>
            ))}
          </ul>
          {eff.length === 0 && <p className="ws-note">등록한 분류 0건 — 캘린더에 과제·세션만 뜬다.</p>}
          <p className="ws-note">등록한 분류의 마감·일정만 홈 캘린더에 뜬다. 등록은 공고 탭의 각 필터에서.</p>
        </>
      )}
    </section>
  )
}
