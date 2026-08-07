// 운영 탭(M3 ②) — 운영진 전용 묶음: 승인대기 / 멤버 관리 / 공지·세션·자료·과제 관리.
// 이중 차단: ①RLS(*_write_staff·members_manage_staff) ②화면(Workspace가 비운영진에게 탭을 그리지 않고,
// 직접 진입(?tab=운영)해도 아래 Denied 안내만 나온다).
import { useState } from 'react'
import Review from './Review.jsx'
import AdminMembers from './AdminMembers.jsx'
import AdminContent from './AdminContent.jsx'
import AdminApplicants from './AdminApplicants.jsx'
import AdminEvents from './AdminEvents.jsx'
import AdminPostings from './AdminPostings.jsx'
import AdminSubmissions from './AdminSubmissions.jsx'
import { CONTACT, CONTACT_MAILTO } from '../data/recruit.js'

const SECTIONS = ['승인대기', '제출 현황', '지원자', '멤버', '콘텐츠', '일정', '공고']

export function Denied() {
  return (
    <section className="ws-block">
      <h2 className="ws-h2">운영 영역</h2>
      <p className="ws-note">운영진 전용 — 현재 계정 권한 없음. 서버 정책(RLS)도 동일하게 거부.</p>
      {/* 문의 채널 = data/recruit.js CONTACT 일원화(2026-08-05 — 이메일 확정) */}
      <p className="ws-note">
        권한 문의 = <a href={CONTACT_MAILTO}>{CONTACT.email}</a>.
      </p>
    </section>
  )
}

export default function Admin({ store, member }) {
  const [section, setSection] = useState(SECTIONS[0])
  // 공통 프레임(ws-cols): 본문 = 하위 영역 / 레일 = 운영 안내(초대 절차·문의) — 전 탭 동일 열 경계 유지.
  return (
    <div className="ws-admin ws-cols">
      <div className="ws-cmain">
        <nav className="ws-tabbar ws-subbar" aria-label="운영 영역">
          {SECTIONS.map((name) => (
            <button
              key={name} type="button" aria-pressed={section === name}
              className={`ws-tabbtn${section === name ? ' on' : ''}`}
              onClick={() => setSection(name)}
            >
              {name}
            </button>
          ))}
        </nav>
        {section === '승인대기' && <Review store={store} />}
        {section === '제출 현황' && <AdminSubmissions store={store} />}
        {section === '지원자' && <AdminApplicants store={store} />}
        {section === '멤버' && <AdminMembers store={store} meId={member?.id} />}
        {section === '콘텐츠' && <AdminContent store={store} />}
        {section === '일정' && <AdminEvents store={store} />}
        {section === '공고' && <AdminPostings store={store} />}
      </div>
      <aside className="ws-crail">
        <section className="ws-block">
          <h2 className="ws-h2">운영 안내</h2>
          <p className="ws-note">계정 초대 = 앱에서 불가(service key) — 절차 = 저장소 <code>supabase/README.md</code> 3·3-1단계.</p>
          <p className="ws-note">권한·계정 문의 = <a href={CONTACT_MAILTO}>{CONTACT.email}</a>.</p>
        </section>
      </aside>
    </div>
  )
}
