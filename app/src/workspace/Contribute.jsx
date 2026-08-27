// 기고 탭(2026-08-06 홈 개편 — 단독 탭 승격, SPEC §0-8) — 내부 초안(DB) → 승인대기 제출 → 운영진 승인 → 게재.
// md 커밋 경유 없음. 게재되면 공개 인사이트가 다음 페치에서 바로 집어간다(클라이언트 페치).
import { useCallback, useEffect, useRef, useState } from 'react'
import { NATURES, TOPICS } from '../content/schema.js'
import { buildPromptKit } from './contrib-format.js'
import { parseContribution } from './contrib-parser.js'
// 승인 대기함(Review)은 M3에서 운영 탭으로 이관 — 기고 화면은 작성자 관점만 담는다.

const EMPTY = {
  제목: '', 성격: NATURES[0], 주제: TOPICS[0], 설명: '', 본문: '',
  source_url: '', source_name: '',
}

// 기고 투트랙(오너 확정 2026-08-06) — 트랙 선택이 첫 화면. 형식은 저장 시 draft.형식으로 실림(0008).
export const TRACKS = [
  ['기본', '사이트 서식으로 게재', 'AI 초안 키트 + 폼 — 디자인은 사이트가 맡음. 글만 쓰면 됨'],
  ['자유', '본인이 디자인까지', '단일 HTML 한 벌을 직접 만들어 붙여넣기 — 게재 시 그 모습 그대로(스크립트 제외)'],
]

// 라디오 역할 대신 aria-pressed 토글 버튼(2026-08-14 검수 — 화살표 키 미구현 radiogroup은 거짓 선언).
function TrackChooser({ track, onPick }) {
  return (
    <div className="ws-tracks">
      {TRACKS.map(([key, name, desc]) => (
        <button
          key={key} type="button" aria-pressed={track === key}
          className={`ws-track${track === key ? ' on' : ''}`} onClick={() => onPick(key)}
        >
          <span className="ws-track-name">{name}</span>
          <span className="ws-track-desc">{desc}</span>
        </button>
      ))}
    </div>
  )
}

// 이어쓰기 트랙 복원(2026-08-14 검수 P0) — 자유(html) 초안을 이어쓰면 저장 시 md로 덮이던 버그의 수리 지점.
export const trackOf = (a) => (a?.['형식'] === 'html' ? '자유' : '기본')

function required(draft) {
  const miss = []
  if (!draft['제목'].trim()) miss.push('제목')
  if (!draft['설명'].trim()) miss.push('설명')
  if (!draft['본문'].trim()) miss.push('본문')
  if (!/^https?:\/\/\S+$/.test(draft.source_url.trim())) miss.push('출처 링크')
  if (!draft.source_name.trim()) miss.push('출처 이름')
  return miss
}

// 1트랙 = 프롬프트 키트 기고(spec 2026-08-05-기고-투트랙 §1) — 프롬프트 복사 → 본인 AI → 출력 붙여넣기 → 필드 분배.
// 수기 입력 흐름은 무변경 — 이 패널은 폼을 채워 줄 뿐, 검토·수정·제출은 기존 폼이 담당한다.
function KitPanel({ onApply }) {
  const [pasted, setPasted] = useState('')
  const [notices, setNotices] = useState([])
  const [note, setNote] = useState('')
  const [copied, setCopied] = useState(false)   // 성공 시 버튼 라벨 2초 스왑(2026-08-14 검수)

  async function copyKit() {
    try {
      await navigator.clipboard.writeText(buildPromptKit())
      setNote('프롬프트 복사 완료 — 본인 AI(ChatGPT·Claude 등)에 붙여넣고 소재 URL 제공')
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setNote('클립보드 복사 실패 — 아래 「프롬프트 전문」을 펼쳐 직접 선택·복사')
    }
  }

  function apply() {
    const r = parseContribution(pasted)
    setNotices(r.notices)
    const n = Object.keys(r.values).length
    if (n > 0) {
      onApply(r.values)
      setNote(`${n}개 필드 반영 — 아래 폼에서 검토·수정 후 제출`)
    } else {
      setNote('')
    }
  }

  return (
    <section className="ws-block">
      <h2 className="ws-h2">AI 초안으로 시작</h2>
      <p className="ws-note">절차: ① 프롬프트 복사 → ② 본인 AI에 붙여넣기 + 소재 URL 제공 → ③ AI 출력 전체를 아래 칸에 붙여넣기 → ④ 폼에 반영 → ⑤ 검토·수정 후 제출</p>
      <div className="ws-form-acts">
        <button type="button" className="ws-signout" onClick={copyKit}>{copied ? '복사됨 ✓' : '프롬프트 복사'}</button>
      </div>
      <details className="ws-kit">
        <summary>프롬프트 전문</summary>
        <pre className="ws-kit-pre">{buildPromptKit()}</pre>
      </details>
      <label className="ws-field">
        <span>AI 초안 붙여넣기</span>
        <textarea className="ws-textarea" rows={6} value={pasted} onChange={(e) => setPasted(e.target.value)} />
      </label>
      <div className="ws-form-acts">
        <button type="button" className="ws-signout" disabled={!pasted.trim()} onClick={apply}>폼에 반영</button>
      </div>
      {note && <p className="ws-ok" role="status">{note}</p>}
      {notices.length > 0 && (
        <ul className="ws-kit-notices" role="status">
          {notices.map((n) => <li key={n}>{n}</li>)}
        </ul>
      )}
    </section>
  )
}

// 내 초안 목록 — 상태 칩 + 이어쓰기.
function MyDrafts({ rows, onEdit }) {
  if (rows.length === 0) return <p className="ws-note">작성한 글 0건.</p>
  return (
    <ul className="ws-list">
      {rows.map((a) => (
        <li key={a.id} className="ws-scrap">
          <div className="ws-row-top">
            <span className="ws-row-title">{a['제목']}</span>
            <span className={`status ${a['상태'] === '게재' ? 'done' : 'prep'}`}>{a['상태']}</span>
            {a['상태'] !== '게재' && (
              <div className="ws-row-acts">
                <button type="button" onClick={() => onEdit(a)}>이어쓰기</button>
              </div>
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}

export default function Contribute({ store }) {
  const [track, setTrack] = useState('기본')
  const [draft, setDraft] = useState(EMPTY)
  const [mine, setMine] = useState([])
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const formRef = useRef(null)    // 이어쓰기 시 폼으로 스크롤(2026-08-14 검수)
  const titleRef = useRef(null)

  const load = useCallback(() => store.articles.listMine()
    .then((rows) => setMine(rows || []))
    .catch((e) => setError(e?.message || '불러오기 실패')), [store])

  useEffect(() => { load() }, [load])

  // 입력 시작 = 이전 성공 메시지 소거(2026-08-14 검수 — 낡은 "저장 완료"가 새 입력에 붙어 보이는 혼동 방지)
  const set = (k) => (e) => { setMsg(''); setDraft((d) => ({ ...d, [k]: e.target.value })) }

  // 이어쓰기 — 트랙 복원(형식 html = 자유) + 폼 스크롤·제목 포커스(2026-08-14 검수)
  function startEdit(a) {
    setDraft({ ...EMPTY, ...a })
    setTrack(trackOf(a))
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    titleRef.current?.focus()
  }

  async function submit(상태) {
    const miss = required(draft)
    if (miss.length) { setError(`필수 항목 미입력: ${miss.join(', ')}`); return }
    setError('')
    setBusy(true)
    try {
      // 형식(0008) — 자유 트랙 = 'html'(상세가 샌드박스 렌더). 컬럼 미적용 DB면 서버가 거부 → 오류 그대로 노출.
      await store.articles.save({ ...draft, 상태, 형식: track === '자유' ? 'html' : 'md' })
      setMsg(상태 === '승인대기' ? '제출 완료 — 운영진 승인 대기' : '초안 저장 완료')
      setDraft(EMPTY)
      await load()
    } catch (e) {
      setError(e?.message || '저장 실패')
    } finally {
      setBusy(false)
    }
  }

  // 공통 프레임(ws-cols): 본문 = 트랙 선택 + 키트 + 작성 폼 / 레일 = 내 글.
  return (
    <div className="ws-contribute ws-cols">
      <div className="ws-cmain">
      <TrackChooser track={track} onPick={setTrack} />
      {track === '기본' && <KitPanel onApply={(values) => setDraft((d) => ({ ...d, ...values }))} />}

      <section className="ws-block" ref={formRef}>
        <h2 className="ws-h2">{draft.id ? '초안 수정' : '새 기고'}</h2>
        <form className="ws-form ws-form-wide" onSubmit={(e) => { e.preventDefault(); submit('승인대기') }}>
          <label className="ws-field">
            <span>제목</span>
            <input ref={titleRef} value={draft['제목']} onChange={set('제목')} />
            {/* 제목 규약 안내(오너 2026-08-15) — 앞절이 카드·북마크 제목이 된다 */}
            <span className="ws-hint">핵심 — 부연 순서로. 앞절만 카드·북마크에 쓰이니 앞절은 그것만 읽어도 뜻이 통하게.</span>
          </label>
          <div className="ws-field-row">
            <label className="ws-field">
              <span>성격</span>
              <select value={draft['성격']} onChange={set('성격')}>
                {NATURES.map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </label>
            <label className="ws-field">
              <span>주제</span>
              <select value={draft['주제']} onChange={set('주제')}>
                {TOPICS.map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </label>
          </div>
          <label className="ws-field">
            <span>설명(카드 1줄)</span>
            <input value={draft['설명']} onChange={set('설명')} />
          </label>
          <div className="ws-field-row">
            <label className="ws-field">
              <span>출처 링크</span>
              <input value={draft.source_url} placeholder="https://..." onChange={set('source_url')} />
            </label>
            <label className="ws-field">
              <span>출처 이름</span>
              <input value={draft.source_name} onChange={set('source_name')} />
            </label>
          </div>
          <label className="ws-field">
            <span>{track === '자유' ? '단일 HTML 전체 붙여넣기(디자인 포함 — 스크립트는 게재 시 실행되지 않음)' : '본문(마크다운)'}</span>
            <textarea className="ws-textarea" rows={12} value={draft['본문']} onChange={set('본문')}
              placeholder={track === '자유' ? '<!doctype html> 또는 <div>… 한 벌 전체' : undefined} />
          </label>
          {error && <p className="ws-error" role="alert">{error}</p>}
          {msg && <p className="ws-ok" role="status">{msg}</p>}
          <div className="ws-form-acts">
            <button type="button" className="ws-signout" disabled={busy} onClick={() => submit('초안')}>초안 저장</button>
            <button type="submit" className="ws-submit" disabled={busy}>승인 요청</button>
          </div>
        </form>
      </section>

      </div>

      <aside className="ws-crail">
        <section className="ws-block">
          <h2 className="ws-h2">내 글</h2>
          <MyDrafts rows={mine} onEdit={startEdit} />
          {/* 첫 방문 레일(2026-08-14 검수) — 0건이면 절차 미니 스테퍼 + 주간 기고 라벨(상태 칩 어휘 동일) */}
          {mine.length === 0 && (
            <>
              <ol className="ws-sublist">
                <li><span className="status prep">초안</span> 작성 후 저장</li>
                <li><span className="status prep">승인대기</span> 승인 요청 제출</li>
                <li><span className="status done">게재</span> 운영진 승인 → 공개 인사이트</li>
              </ol>
              <p className="ws-note">기고는 선택입니다. 인사이트 발행은 운영진이 매주 하고, 멤버 글은 승인 후 게재됩니다.</p>
            </>
          )}
        </section>
      </aside>
    </div>
  )
}
