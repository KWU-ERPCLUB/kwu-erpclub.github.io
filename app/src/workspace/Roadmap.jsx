// 1기 로드맵 — 흐름 탭의 커리큘럼 진입점(2026-08-06 신설 · 2026-08-13 클릭형 개편 — 구 「차시 진행」 섹션 흡수).
// 차시를 누르면 세부(정적 큐레이션 + DB 세션 날짜·설명·본문·자료 — 해금 0011·0012 준수)가 드롭박스로 열리고,
// 발제 글이 발행된 차시는 세미나 상세(/seminars/?p=슬러그)로 이어진다(회차 매칭 — 오너 2026-08-13: 차시 내용은 공개).
// 원천 = workspace erp-club/docs/specs/2026-07-27-aim-운영틀.md §2(확정값) + aim-커리큘럼-로드맵.md(멤버용 큐레이션).
// 게재 규칙: 미확정 값은 '추후 확정/추후 공지' 표기. 내부 설계(지표·게이트 세부)는 게재하지 않는다.
import { useEffect, useMemo, useState } from 'react'
import { weekStatus } from './calendar-logic.js'
import { loadContent } from '../content/loader.js'
import Markdown from '../pages/Markdown.jsx'
import { isLockedMaterial } from './Sessions.jsx'

export const STATUS_CLASS = { '이번 주': 'now', 지난: 'past', 예정: 'next' }

// no = 회차 매칭 키(DB sessions.회차 · 세미나 frontmatter 회차와 조인). 차시 번호 1~9 연속(2026-08-13 2단 재편).
// 값 원천 = 운영틀 §2·§4(2026-08-13 2단 재편) — 내부 설계(이양·게이트 세부)는 게재하지 않는다.
const TIMELINE = [
  { type: 'phase', 라벨: '모집', 기간: '08-25 ~ 09-08', 설명: '전공 무관 교내 개방 — 신청 = 공개 사이트 RECRUIT' },
  { type: 'phase', 라벨: '1차 프로젝트 — 생활밀착 개인', 기간: '09-07 주 ~ 10-06', 설명: '매주 대면 60분(요일 추후 확정) — 각자 생활·학업의 반복 작업 하나를 AI 루틴으로 바꾸고, 전·후를 숫자로 남긴다' },
  {
    type: 'session', no: 1, 회차: '1회', 주: '09-07 주', 주제: 'OT — 세팅과 큰 그림',
    배움: 'AIM이 무엇을 하는 곳인지, 그리고 팀 프로젝트 주제 미리 보기',
    세부: ['사전 설치 확인(가이드 배포)', '허브·인사이트 사용법 투어', '개인 소재 예시 + 팀 주제 공개', '시작 설문'],
  },
  {
    type: 'session', no: 2, 회차: '2회', 주: '09-14 주', 주제: '기고 1건 + 내 소재 확정',
    배움: '같은 프롬프트로 전원이 같은 결과를 만들어 보고, 내가 자동화할 반복 작업을 고른다',
    세부: ['인사이트 기고 1건 제출', '소재 선정 카드 작성', '제작 착수'],
  },
  {
    type: 'session', no: 3, 회차: '3회', 주: '09-21 주', 주제: '제작 스프린트',
    배움: '내 소재를 직접 굴린다 — 막힌 구간은 그 자리에서 함께 푼다',
    세부: ['전·후 측정 방법 정하기', '추석 인접 — 일정 조정 가능'],
  },
  {
    type: 'session', no: 4, 회차: '4회', 주: '09-28 주 ~ 10-06', 주제: '1차 쇼케이스 + 팀 결성',
    배움: '전·후 첫 실측을 발표하고, 팀 프로젝트의 팀·주제·역할을 확정한다',
    세부: ['1인 3분 발표', '팀·주제·역할 확정', '휴지 중 할 일 분담'],
  },
  { type: 'phase', 라벨: '시험 휴지', 기간: '10-07 ~ 10-26', 설명: '세션 없음 — 개인 산출물은 계속 쓰고(주중 폼), 팀은 자료 수집·기획 초안을 비동기로' },
  { type: 'phase', 라벨: '2차 프로젝트 — 팀', 기간: '10-27 주 ~ 11-24', 설명: '실재 조직·업무의 프로세스 하나를 팀으로 재설계한다 — 기획은 사람, 구현은 AI 위임' },
  {
    type: 'session', no: 5, 회차: '5회', 주: '10-27 주', 주제: '기획서(PRD) 확정',
    배움: '휴지 중 다듬은 기획서를 팀 간 교차 채점으로 확정하고 구현에 들어간다',
    세부: ['기획서 빈칸 전부 채움', '팀 간 교차 채점'],
  },
  {
    type: 'session', no: 6, 회차: '6회', 주: '11-02 주', 주제: '팀 MVP 첫 동작',
    배움: '기획서대로 AI에 시켜 첫 동작물을 만든다',
    세부: ['위임 기록 남기기', '중간 설문'],
  },
  {
    type: 'session', no: 7, 회차: '7회', 주: '11-09 주', 주제: '기획서 v2 — 실패 반영',
    배움: 'AI 위임에서 안 된 지점을 기획에 반영한다 — 개정 이력이 학습의 물증',
    세부: ['위임 기록 → 개정 이력'],
  },
  {
    type: 'session', no: 8, 회차: '8회', 주: '11-16 주', 주제: '검수 · 발표 리허설',
    배움: '만든 사람이 아닌 사용자의 눈으로 결과물을 확인한다',
    세부: ['실사용 확인', '발표 리허설'],
  },
  {
    type: 'session', no: 9, 회차: '9회', 주: '~11-24', 주제: '최종 발표',
    배움: '개인 패키지와 팀 산출물을 전·후 비교로 발표한다',
    세부: ['발표 형태 = 요일 확정 후 공지', '허브 게재 + 종강 설문'],
  },
]

// 회차 매칭 — 정적 로드맵 no ↔ DB sessions.회차 ↔ 세미나 frontmatter 회차. 순수(테스트 대상).
export const findByNo = (rows, no) => rows.find((r) => Number(r['회차']) === no) || null
export const seminarHref = (sem) => (sem ? `/seminars/?p=${sem.slug}` : null)

function PhaseNode({ item }) {
  return (
    <li className="ws-rm-phase">
      <div className="ws-rm-head">
        <span className="ws-rm-label">{item.라벨}</span>
        <span className="ws-rm-when">{item.기간}</span>
      </div>
      <p className="ws-rm-desc">{item.설명}</p>
    </li>
  )
}

// 차시 노드 — 접힘 = 회차·주제·날짜·배울 것 한눈에(2026-08-06 오너 요구 유지) / 펼침 = 세부·자료·세미나 진입.
// 잠금: 미래 공개일 행이 보인다 = 운영진(RLS가 멤버에겐 안 내려보냄) → 🔒 표기.
function SessionNode({ item, session, note, materials, seminar, todayKey, opened, onToggle }) {
  const date = session?.['날짜'] || null
  const st = date ? weekStatus(date, todayKey) : null
  const noteLocked = note && isLockedMaterial(note)
  return (
    <li className="ws-rm-item">
      <div className={`ws-rm-card${opened ? ' open' : ''}`}>
        <button type="button" className="ws-flow-toggle ws-rm-toggle" onClick={onToggle} aria-expanded={opened}>
          <div className="ws-rm-head-row">
            <span className="ws-rm-no">{item.회차}</span>
            <span className="ws-rm-topic">{item.주제}</span>
            {st && <span className={`ws-flow-status ${STATUS_CLASS[st]}`}>{st}</span>}
            <span className="ws-rm-when">{date || item.주}</span>
            <span className="ws-rm-caret" aria-hidden="true">{opened ? '▴' : '▾'}</span>
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
        {TIMELINE.map((item, i) => {
          if (item.type === 'phase') return <PhaseNode key={i} item={item} />
          const session = findByNo(sessions, item.no)
          return (
            <SessionNode
              key={i}
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
