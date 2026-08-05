// 운영 탭(M3 ②) — 운영진 전용 묶음: 승인대기 / 멤버 관리 / 공지·세션·자료·과제 관리.
// 이중 차단: ①RLS(*_write_staff·members_manage_staff) ②화면(Workspace가 비운영진에게 탭을 그리지 않고,
// 직접 진입(?tab=운영)해도 아래 Denied 안내만 나온다).
import { useState } from 'react'
import Review from './Review.jsx'
import AdminMembers from './AdminMembers.jsx'
import AdminContent from './AdminContent.jsx'
import AdminApplicants from './AdminApplicants.jsx'
import { CONTACT, KAKAO_PENDING, hasKakaoChat } from '../data/recruit.js'

const SECTIONS = ['승인대기', '지원자', '멤버', '콘텐츠']

export function Denied() {
  return (
    <section className="ws-block">
      <h2 className="ws-h2">운영 영역</h2>
      <p className="ws-note">운영진 전용 — 현재 계정 권한 없음. 서버 정책(RLS)도 동일하게 거부.</p>
      {/* 단톡방 = data/recruit.js CONTACT 일원화(2026-08-05) — URL 없으면 링크 대신 안내 문구 */}
      <p className="ws-note">
        권한 문의 = 운영진 단톡방
        {hasKakaoChat() ? <> — <a href={CONTACT.kakaoOpenChatUrl}>열기</a></> : ` (${KAKAO_PENDING})`}.
      </p>
    </section>
  )
}

export default function Admin({ store, member }) {
  const [section, setSection] = useState(SECTIONS[0])
  return (
    <div className="ws-admin">
      <h2 className="ws-h2">운영</h2>
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
      {section === '지원자' && <AdminApplicants store={store} />}
      {section === '멤버' && <AdminMembers store={store} meId={member?.id} />}
      {section === '콘텐츠' && <AdminContent store={store} />}
    </div>
  )
}
