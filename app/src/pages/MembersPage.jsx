import { SiteNav, SiteFooter } from '../shared.jsx'

const profiles = import.meta.glob('/members/*/profile.json', { import: 'default', eager: true })

export default function MembersPage() {
  const list = Object.values(profiles).sort((a, b) => a.id.localeCompare(b.id))
  return (
    <>
      <SiteNav />
      <main className="hub-page">
        <header className="hub-head">
          <h1>MEMBERS</h1>
          <p>스터디원 공개 프로필. 개인 페이지는 각자 폴더에서 각자의 방식으로 만든다.</p>
        </header>
        {list.length === 0 && <p className="hub-empty">등록된 프로필이 없다.</p>}
        <ul className="hub-list">
          {list.map((m) => (
            <li key={m.id} className="hub-card">
              {m.page ? (
                <a className="hub-card-link" href={`/members/${m.id}/`}>
                  <span className="hub-card-title">{m.name}</span>
                  <span className="hub-meta">{m.intro} · {(m.tracks || []).join(' · ')}</span>
                </a>
              ) : (
                <div className="hub-card-inner">
                  <span className="hub-card-title">{m.name}</span>
                  <span className="hub-meta">{m.intro} · 개인 페이지 준비</span>
                </div>
              )}
            </li>
          ))}
        </ul>
      </main>
      <SiteFooter />
    </>
  )
}
