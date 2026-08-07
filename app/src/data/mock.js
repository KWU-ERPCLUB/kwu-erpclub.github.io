// 목 저장소 — 네트워크 없이 도는 메모리 구현(SPEC §1 "공개면 테스트가 DB 없이 돌게", 판정 P4).
// 용도 = ①테스트 ②env 미설정 로컬 개발. 실배포 데이터와 무관한 합성값만 둔다(실명·실값 금지).
// 주의: 여기 데이터는 프로세스 메모리에만 있다 — DB를 지우거나 쓰는 코드는 존재하지 않는다.
// 시드 데이터 = mock-seed.js 분할(300줄 규격, 2026-08-07).
import { SEED } from './mock-seed.js'

const clone = (rows) => rows.map((r) => ({ ...r }))

// user = 시작 시 로그인 상태를 가정할 멤버 id(기본 null = 비로그인).
export function createMockRepositories({ user = null, data = {} } = {}) {
  const store = Object.fromEntries(
    Object.entries(SEED).map(([k, rows]) => [k, clone(data[k] || rows)]),
  )
  let currentId = user

  const memberOf = (id) => store.members.find((m) => m.id === id) || null
  const isStaff = () => memberOf(currentId)?.role === '운영진'

  // 운영 콘텐츠 저장(공지·세션·자료·과제) — RLS *_write_staff를 목에서도 흉내낸다.
  const saveRow = (table, prefix) => async (row) => {
    if (!isStaff()) throw new Error('권한 없음')
    if (row.id) {
      const found = store[table].find((r) => r.id === row.id)
      if (!found) throw new Error('대상 없음')
      Object.assign(found, { ...row, id: found.id })
      return { ...found }
    }
    const created = { ...row, id: `${prefix}${store[table].length + 1}` }
    store[table].push(created)
    return { ...created }
  }

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
      // GoTrue 규칙 동형: 로그인 필요 + 최소 6자(Supabase 기본 min length)
      async updatePassword(newPassword) {
        if (!currentId) throw new Error('로그인 필요')
        if (String(newPassword || '').length < 6) throw new Error('비밀번호는 6자 이상')
        return true
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
      // 전공 — 운영진은 전원, 스터디원은 본인 1행만(RLS member_private_select_self_or_staff 동형)
      async listPrivate() {
        if (!currentId) return []
        if (isStaff()) return clone(store.member_private)
        return clone(store.member_private.filter((p) => p.member_id === currentId))
      },
      async updateMe(patch) {
        const row = memberOf(currentId)
        if (!row) throw new Error('로그인 필요')
        const { role, id, ...safe } = patch   // role·id는 본인 수정 대상이 아니다(RLS와 동형)
        void role; void id
        Object.assign(row, safe)
        return { ...row }
      },
      async setRole(memberId, role) {
        if (!isStaff()) throw new Error('권한 없음')
        const row = memberOf(memberId)
        if (!row) throw new Error('대상 없음')
        row.role = role
        return { ...row }
      },
    },
    articles: {
      async listPublished() {
        return clone(store.articles.filter((a) => a.상태 === '게재'))
      },
      async listMine() {
        return clone(store.articles.filter((a) => a.작성자 === currentId))
      },
      async listPending() {
        if (memberOf(currentId)?.role !== '운영진') return []   // RLS가 하는 일을 목에서도 흉내낸다
        return clone(store.articles.filter((a) => a.상태 === '승인대기'))
      },
      async save(draft) {
        if (!currentId) throw new Error('로그인 필요')
        if (draft.id) {
          const row = store.articles.find((a) => a.id === draft.id && a.작성자 === currentId)
          if (!row) throw new Error('대상 없음')
          Object.assign(row, { ...draft, id: row.id })
          return { ...row }
        }
        const row = {
          ...draft,
          id: `mock-a${store.articles.length + 1}`,
          슬러그: draft['슬러그'] || `mock-slug-${store.articles.length + 1}`,
          작성자: currentId,
        }
        store.articles.push(row)
        return { ...row }
      },
      async setStatus(articleId, 상태) {
        if (memberOf(currentId)?.role !== '운영진') throw new Error('권한 없음')
        const row = store.articles.find((a) => a.id === articleId)
        if (!row) throw new Error('대상 없음')
        row.상태 = 상태
        if (상태 === '게재' && !row.게재일) row.게재일 = '2026-09-01'
        return { ...row }
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
            return { article_id: r.article_id, articles: a ? { 슬러그: a.슬러그, 제목: a.제목, 게재일: a.게재일, 성격: a.성격, 설명: a.설명 } : null }
          })
      },
      async toggleLike(articleId, on) { return toggle('article_likes', articleId, on) },
      async toggleBookmark(articleId, on) { return toggle('article_bookmarks', articleId, on) },
    },
    sessions: {
      async list() { return clone(store.sessions) },
      save: saveRow('sessions', 'mock-s'),
    },
    flow: {
      async list() { return clone(store.flow_weeks) },
      save: saveRow('flow_weeks', 'mock-f'),
      async remove(rowId) {
        if (!isStaff()) throw new Error('권한 없음')
        const at = store.flow_weeks.findIndex((e) => e.id === rowId)
        if (at < 0) throw new Error('대상 없음')
        store.flow_weeks.splice(at, 1)
        return rowId
      },
    },
    events: {
      async list() { return clone(store.events) },
      save: saveRow('events', 'mock-e'),
      async remove(rowId) {
        if (!isStaff()) throw new Error('권한 없음')
        const at = store.events.findIndex((e) => e.id === rowId)
        if (at < 0) throw new Error('대상 없음')
        store.events.splice(at, 1)
        return rowId
      },
    },
    postings: {
      async list() { return clone(store.postings) },
      save: saveRow('postings', 'mock-p'),
      async remove(rowId) {
        if (!isStaff()) throw new Error('권한 없음')
        const at = store.postings.findIndex((e) => e.id === rowId)
        if (at < 0) throw new Error('대상 없음')
        store.postings.splice(at, 1)
        return rowId
      },
    },
    materials: {
      async list() { return clone(store.session_materials) },
      save: saveRow('session_materials', 'mock-m'),
    },
    assignments: {
      async list() { return clone(store.assignments) },
      save: saveRow('assignments', 'mock-h'),
    },
    submissions: {
      async listMine() {
        return clone(store.submissions.filter((s) => s.member_id === currentId))
      },
      // RLS submissions_select_own_or_staff 동형 — 운영진 = 전원, 스터디원 = 본인 행만.
      async listAll() {
        if (isStaff()) return clone(store.submissions)
        return clone(store.submissions.filter((s) => s.member_id === currentId))
      },
      async submit({ id, assignment_id, url, 메모 = '' }) {
        if (!currentId) throw new Error('로그인 필요')
        if (id) {
          const row = store.submissions.find((s) => s.id === id && s.member_id === currentId)
          if (!row) throw new Error('대상 없음')
          Object.assign(row, { url, 메모 })
          return { ...row }
        }
        const row = {
          id: `mock-sub${store.submissions.length + 1}`,
          assignment_id, member_id: currentId, url, 메모,
        }
        store.submissions.push(row)
        return { ...row }
      },
    },
    notices: {
      async listInternal() { return clone(store.notices) },
      save: saveRow('notices', 'mock-n'),
    },
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
      async update(rowId, patch) {
        const row = store.collections.find((c) => c.id === rowId && c.member_id === currentId)
        if (!row) throw new Error('대상 없음')
        Object.assign(row, patch)
        return { ...row }
      },
      async remove(rowId) {
        const at = store.collections.findIndex((c) => c.id === rowId && c.member_id === currentId)
        if (at < 0) throw new Error('대상 없음')
        store.collections.splice(at, 1)
        return rowId
      },
    },
    seminars: { async list() { return clone(store.seminars) } },
    // 신청서 — 제출은 로그인 불필요(RLS applications_insert_anyone 동형), 열람은 운영진만(비운영진 = 0행).
    applications: {
      async submit(form) {
        const row = { ...form, id: `mock-app${store.applications.length + 1}`, created_at: new Date().toISOString() }
        store.applications.push(row)
        return true
      },
      async list() {
        if (!isStaff()) return []
        return clone(store.applications)
      },
    },
  }
}
