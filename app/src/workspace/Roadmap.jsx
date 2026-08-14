// 1기 로드맵 — 흐름 탭의 커리큘럼 진입점(2026-08-06 신설 · 2026-08-13 클릭형 개편 — 구 「차시 진행」 섹션 흡수).
// 차시를 누르면 세부(정적 큐레이션 + DB 세션 날짜·설명·본문·자료 — 해금 0011·0012 준수)가 드롭박스로 열리고,
// 발제 글이 발행된 차시는 세미나 상세(/seminars/?p=슬러그)로 이어진다(회차 매칭 — 오너 2026-08-13: 차시 내용은 공개).
// 원천 = data/aim-roadmap.js AIM_TIMELINE(2026-08-14 일원화 — /recruit 로드맵과 공유. 로드맵 개정 = 그 파일 1곳).
// 게재 규칙: 미확정 값은 '추후 확정/추후 공지' 표기. 내부 설계(지표·게이트 세부)는 게재하지 않는다.
import { useEffect, useMemo, useState } from 'react'
import { weekStatus } from './calendar-logic.js'
import { loadContent } from '../content/loader.js'
import { AIM_TIMELINE } from '../data/aim-roadmap.js'
import Markdown from '../pages/Markdown.jsx'
import { isLockedMaterial } from './Sessions.jsx'

export const STATUS_CLASS = { '이번 주': 'now', 지난: 'past', 예정: 'next' }

// 회차 매칭 — 정적 로드맵 no ↔ DB sessions.회차 ↔ 세미나 frontmatter 회차. 순수(테스트 대상).
export const findByNo = (rows, no) => rows.find((r) => Number(r['회차']) === no) || null
export const seminarHref = (sem) => (sem ? `/seminars/?p=${sem.slug}` : null)

// 구간 노드 — 면 밴드 + 검정 pill 라벨(2026-08-14 시각 강화: "분할된 로드맵"이 한눈에 보이게)
function PhaseNode({ item, delay }) {
  return (
    <li className="ws-rm-phase" style={{ animationDelay: `${delay}ms` }}>
      <div className="ws-rm-phaseband">
        <div className="ws-rm-head">
          <span className="ws-rm-plabel">{item.라벨}</span>
          <span className="ws-rm-when">{item.기간}</span>
        </div>
        <p className="ws-rm-desc">{item.설명}</p>
      </div>
    </li>
  )
}

// 차시 노드 — 접힘 = 회차·주제·날짜·배울 것 한눈에(2026-08-06 오너 요구 유지) / 펼침 = 세부·자료·세미나 진입.
// 잠금: 미래 공개일 행이 보인다 = 운영진(RLS가 멤버에겐 안 내려보냄) → 🔒 표기.
function SessionNode({ item, session, note, materials, seminar, todayKey, opened, onToggle, delay }) {
  const date = session?.['날짜'] || null
  const st = date ? weekStatus(date, todayKey) : null
  const noteLocked = note && isLockedMaterial(note)
  return (
    <li className={`ws-rm-item${st ? ` is-${STATUS_CLASS[st]}` : ''}`} style={{ animationDelay: `${delay}ms` }}>
      {/* 번호 원 배지 = 스파인 위(2026-08-14 시각 강화 — 차시가 포인트로 보이게) */}
      <span className="ws-rm-nno" aria-hidden="true">{item.no}</span>
      <div className={`ws-rm-card${opened ? ' open' : ''}`}>
        <button type="button" className="ws-flow-toggle ws-rm-toggle" onClick={onToggle} aria-expanded={opened}>
          <div className="ws-rm-head-row">
            <span className="ws-rm-topic">{item.주제}</span>
            {st && <span className={`ws-flow-status ${STATUS_CLASS[st]}`}>{st}</span>}
            <span className="ws-rm-when">{date || item.주}</span>
            <span className="ws-rm-caret" aria-hidden="true">▾</span>
          </div>
          <p className="ws-rm-learn">{item.배움}</p>
        </button>
        {opened && (
          <div className="ws-rm-body">
            <ul className="ws-rm-notes">
              {item.세부.map((n) => <li key={n}>{n}</li>)}
            </ul>
            {session?.['설명'] && <p className="ws-rm-desc">{session['설명']}</p>}
            {note && !noteLocked && <div className="ws-rm-note"><Markdown body={note['본문'] || ''} /></div>}
            {noteLocked && <p className="ws-note">🔒 차시 내용 — {note['공개일']} 공개(운영진에게만 보임)</p>}
            {materials.length > 0 && (
              <ul className="ws-sublist">
                {materials.map((m) => (
                  <li key={m.id}>
                    {isLockedMaterial(m)
                      ? <span className="ws-note">🔒 {m['제목']} — {m['공개일']} 공개(운영진에게만 보임)</span>
                      : m.url
                        ? <a href={m.url} target="_blank" rel="noreferrer">{m['제목']}</a>
                        : <span>{m['제목']} — 파일 자료(내려받기 = M4)</span>}
                  </li>
                ))}
              </ul>
            )}
            {seminar
              ? <a className="ws-rm-sem" href={seminarHref(seminar)}>세미나에서 이 차시 보기 →</a>
              : !note && <p className="ws-note">차시 내용 준비 중 — 발제 글이 발행되면 세미나로 이어짐.</p>}
          </div>
        )}
      </div>
    </li>
  )
}

export default function RoadmapSection({ store, todayKey }) {
  const seminars = useMemo(() => loadContent('세미나'), [])
  const [sessions, setSessions] = useState([])
  const [notes, setNotes] = useState([])
  const [materials, setMaterials] = useState([])
  const [open, setOpen] = useState(null)
  const [error, setError] = useState('')

  // DB 실패해도 정적 커리큘럼은 그대로 보인다 — 오류는 한 줄 안내로만.
  useEffect(() => {
    let on = true
    Promise.all([store.sessions.list(), store.notes.list(), store.materials.list()])
      .then(([s, n, m]) => { if (on) { setSessions(s || []); setNotes(n || []); setMaterials(m || []) } })
      .catch((e) => { if (on) setError(e?.message || '세션 정보 불러오기 실패') })
    return () => { on = false }
  }, [store])

  return (
    <section className="ws-block ws-roadmap">
      <h2 className="ws-h2">1기 로드맵</h2>
      <p className="ws-note">차시를 누르면 세부·자료가 열림. 발제 글이 있는 차시는 세미나로 이어짐. 🔒 = 공개일 전.</p>
      {error && <p className="ws-error" role="alert">{error}</p>}
      <ol className="ws-rm">
        {AIM_TIMELINE.map((item, i) => {
          if (item.type === 'phase') return <PhaseNode key={i} item={item} delay={i * 45} />
          const session = findByNo(sessions, item.no)
          return (
            <SessionNode
              key={i}
              delay={i * 45}
              item={item}
              session={session}
              note={session ? notes.find((n) => n.session_id === session.id) : null}
              materials={session ? materials.filter((m) => m.session_id === session.id) : []}
              seminar={findByNo(seminars, item.no)}
              todayKey={todayKey}
              opened={open === item.no}
              onToggle={() => setOpen(open === item.no ? null : item.no)}
            />
          )
        })}
      </ol>
    </section>
  )
}
