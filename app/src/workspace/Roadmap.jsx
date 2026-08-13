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

// no = 회차 매칭 키(DB sessions.회차 · 세미나 frontmatter 회차와 조인). 팀 국면은 6~9로 이어 붙인다.
const TIMELINE = [
  { type: 'phase', 라벨: '모집', 기간: '08-25 ~ 09-08', 설명: '전공 무관 교내 개방 — 신청 = 공개 사이트 RECRUIT' },
  { type: 'phase', 라벨: '1차 프로젝트 — 개인', 기간: '09-07 주 ~ 10-05 주', 설명: '매주 대면 60분(요일 추후 확정) — 각자 반복 작업 하나를 AI로 바꾼다' },
  {
    type: 'session', no: 1, 회차: '1회', 주: '09-07 주', 주제: '킥오프 — 질문에서 위임으로',
    배움: 'AI 활용의 큰 그림, 그리고 내가 다룰 소재 고르기',
    세부: ['매주 반복하는 내 작업 생각해 오기', '소재 선정 카드 작성', '시작 설문'],
  },
  {
    type: 'session', no: 2, 회차: '2회', 주: '09-14 주', 주제: '다섯 활용 축 체험',
    배움: '리서치 · 기획 · 구현 위임 · 자동화 · 배포 — 다섯 축을 무료 도구로 직접 맛본다',
    세부: ['내 소재에 맞는 축 고르기(매핑 시트)', '도구 목록 = 세션에서 배포'],
  },
  {
    type: 'session', no: 3, 회차: '3회', 주: '09-21 주', 주제: '공통 미니과제',
    배움: '전원 같은 과제로 위임을 연습한다 — 시키는 법·받아낸 결과를 비교',
    세부: ['과제 소재 = 추후 공지', '추석 인접 — 일정 조정 가능'],
  },
  {
    type: 'session', no: 4, 회차: '4회', 주: '09-28 주', 주제: '본인 소재 제작',
    배움: '내 산출물을 만들고, 서로의 결과물을 검수한다',
    세부: ['상호 검수 → 운영진 첨삭', '다음 주 발표 준비'],
  },
  {
    type: 'session', no: 5, 회차: '5회', 주: '10-05 주', 주제: '중간 쇼케이스',
    배움: '전·후 비교로 발표한다 — 내 작업이 무엇에서 무엇으로 바뀌었나',
    세부: ['1인 발표 + 허브 게재', '중간 설문'],
  },
  { type: 'phase', 라벨: '시험 휴지', 기간: '10-06 ~ 10-26', 설명: '중간고사 2주 전부터 활동 중지' },
  { type: 'phase', 라벨: '2차 프로젝트 — 팀', 기간: '10-27 주 ~ 11-23 주', 설명: '팀으로 실전 주제 하나를 완성한다 — 기획은 사람, 구현은 AI 위임' },
  {
    type: 'session', no: 6, 회차: '팀 편성', 주: '10-27 주', 주제: '주제 선택 · 역할 나누기',
    배움: '주제 풀에서 팀별로 선택하고 다섯 축을 역할로 나눈다',
    세부: ['주제 풀 = 추후 공지'],
  },
  {
    type: 'session', no: 7, 회차: '기획', 주: '11-02 주', 주제: '기획서(PRD) 작성',
    배움: '무엇을 · 어떤 기준으로 만들지 팀이 정의한다',
    세부: ['기획서 틀 = 세션에서 배포', '팀 간 교차 검토'],
  },
  {
    type: 'session', no: 8, 회차: '구현', 주: '11-09 주', 주제: 'AI 위임 구현',
    배움: '기획서대로 AI에 시키고, 안 되는 지점을 기획에 반영한다',
    세부: ['위임 기록 남기기'],
  },
  {
    type: 'session', no: 9, 회차: '검수', 주: '11-16 주', 주제: '검수 · 보완',
    배움: '만든 사람이 아닌 눈으로 결과물을 확인한다',
    세부: ['실사용 확인', '발표 자료 준비'],
  },
  { type: 'phase', 라벨: '최종 발표', 기간: '추후 확정', 설명: '기말(12-08) 전 — 팀 산출물 발표 + 허브 게재' },
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
