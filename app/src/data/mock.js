// 목 저장소 — 네트워크 없이 도는 메모리 구현(SPEC §1 "공개면 테스트가 DB 없이 돌게", 판정 P4).
// 용도 = ①테스트 ②env 미설정 로컬 개발. 실배포 데이터와 무관한 합성값만 둔다(실명·실값 금지).
// 주의: 여기 데이터는 프로세스 메모리에만 있다 — DB를 지우거나 쓰는 코드는 존재하지 않는다.

const SEED = {
  members: [
    { id: 'mock-staff', 이름: '운영진 A', role: '운영진', 학번: '2020000001', 자기소개: '샘플 소개', 관심사: ['자동화'], 가입일: '2026-09-01' },
    { id: 'mock-member', 이름: '스터디원 B', role: '스터디원', 학번: '2020000002', 자기소개: '샘플 소개', 관심사: ['에이전트'], 가입일: '2026-09-01' },
  ],
  articles: [
    { id: 'mock-a1', 슬러그: 'sample-published', 제목: '샘플 게재 기사', 설명: '목 데이터', 성격: '트렌드', 주제: '에이전트', 상태: '게재', 작성자: 'mock-staff', 게재일: '2026-09-10' },
    { id: 'mock-a2', 슬러그: 'sample-draft', 제목: '샘플 초안', 설명: '목 데이터', 성격: '심층 분석', 주제: '시장·생태계', 상태: '초안', 작성자: 'mock-member', 게재일: null },
  ],
  sessions: [{ id: 'mock-s1', 회차: 1, 날짜: '2026-09-08', 제목: '샘플 세션', 설명: '목 데이터' }],
  assignments: [{ id: 'mock-h1', session_id: 'mock-s1', 제목: '샘플 과제', 마감: null }],
  submissions: [{ id: 'mock-sub1', assignment_id: 'mock-h1', member_id: 'mock-member', url: 'https://example.com/sample', 메모: '' }],
  notices: [{ id: 'mock-n1', 제목: '샘플 공지', 본문: '목 데이터', 내부여부: true }],
  collections: [{ id: 'mock-c1', member_id: 'mock-member', url: 'https://example.com/scrap', 메모: '샘플 스크랩' }],
  article_likes: [{ member_id: 'mock-member', article_id: 'mock-a1' }],
  article_bookmarks: [{ member_id: 'mock-member', article_id: 'mock-a1' }],
  seminars: [{ id: 'mock-sem1', 회차: 1, 날짜: '2026-09-20', 제목: '샘플 세미나', 유형: '인지', 공개여부: true }],
}

const clone = (rows) => rows.map((r) => ({ ...r }))

// user = 시작 시 로그인 상태를 가정할 멤버 id(기본 null = 비로그인).
export function createMockRepositories({ user = null, data = {} } = {}) {
  const store = Object.fromEntries(
    Object.entries(SEED).map(([k, rows]) => [k, clone(data[k] || rows)]),
  )
  let currentId = user

  const memberOf = (id) => store.members.find((m) => m.id === id) || null

  // 상호작용 토글 — 메모리 배열에서 본인 행만 넣고 뺀다(DB 삭제 아님).
  function toggle(table, articleId, on) {
    if (!currentId) throw new Error('로그인 필요')
    const rows = store[table]
    const at = rows.findIndex((r) => r.member_id === currentId && r.article_id === articleId)
    if (on && at < 0) rows.push({ member_id: currentId, article_id: articleId })
    if (!on && at >= 0) rows.splice(at, 1)
    return on
  }

  return {
    auth: {
      currentUser: () => (currentId ? { id: currentId, email: `${currentId}@example.com` } : null),
      // 입력 = 학번(§0-4) 또는 이메일. 목에서는 학번·id 어느 쪽으로도 찾고, 못 찾으면 첫 멤버로 로그인.
      async signIn(loginId) {
        const key = String(loginId ?? '').trim()
        const found = store.members.find((m) => m.학번 === key)
          || store.members.find((m) => `${m.id}@example.com` === key)
          || store.members[0]
        currentId = found.id
        return { user: { id: currentId, email: `${currentId}@example.com` } }
      },
      async signOut() {
        currentId = null
      },
    },
    members: {
      async me() {
        return memberOf(currentId)
      },
      async list() {
        // 전공은 목 데이터에도 없다(P5 — 사적 필드는 member_private). 학번 = 로그인 ID(§0-5 개정)로 명단에 포함.
        return clone(store.members)
      },
    },
    articles: {
      async listPublished() {
        return clone(store.articles.filter((a) => a.상태 === '게재'))
      },
      async listMine() {
        return clone(store.articles.filter((a) => a.작성자 === currentId))
      },
    },
    interactions: {
      // 총계 = 게재 기사에 한정(뷰 article_interaction_counts와 같은 모양)
      async counts() {
        return store.articles.filter((a) => a.상태 === '게재').map((a) => ({
          article_id: a.id,
          슬러그: a.슬러그,
          좋아요수: store.article_likes.filter((r) => r.article_id === a.id).length,
          북마크수: store.article_bookmarks.filter((r) => r.article_id === a.id).length,
        }))
      },
      async mine() {
        if (!currentId) return { likes: [], bookmarks: [] }
        return {
          likes: store.article_likes.filter((r) => r.member_id === currentId).map((r) => r.article_id),
          bookmarks: store.article_bookmarks.filter((r) => r.member_id === currentId).map((r) => r.article_id),
        }
      },
      async listBookmarked() {
        if (!currentId) return []
        return store.article_bookmarks
          .filter((r) => r.member_id === currentId)
          .map((r) => {
            const a = store.articles.find((x) => x.id === r.article_id)
            return { article_id: r.article_id, articles: a ? { 슬러그: a.슬러그, 제목: a.제목, 게재일: a.게재일, 성격: a.성격 } : null }
          })
      },
      async toggleLike(articleId, on) { return toggle('article_likes', articleId, on) },
      async toggleBookmark(articleId, on) { return toggle('article_bookmarks', articleId, on) },
    },
    sessions: { async list() { return clone(store.sessions) } },
    assignments: { async list() { return clone(store.assignments) } },
    submissions: {
      async listMine() {
        return clone(store.submissions.filter((s) => s.member_id === currentId))
      },
    },
    notices: { async listInternal() { return clone(store.notices) } },
    collections: {
      async listMine() {
        return clone(store.collections.filter((c) => c.member_id === currentId))
      },
      async add({ url, 메모 = '' }) {
        if (!currentId) throw new Error('로그인 필요')
        const row = { id: `mock-c${store.collections.length + 1}`, member_id: currentId, url, 메모 }
        store.collections.push(row)
        return { ...row }
      },
    },
    seminars: { async list() { return clone(store.seminars) } },
  }
}
