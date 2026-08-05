// 저장소 계층 — 화면이 소비하는 유일한 데이터 인터페이스(SPEC §1 "저장소 모듈 경유만").
// 여기서 정의한 메서드 집합 = 목 저장소(mock.js)와 동일해야 한다(계약 테스트가 강제).
// 실제 권한 판정은 서버 RLS(0002_rls.sql)가 한다 — 여기 필터는 편의일 뿐 방어선이 아니다.

import { toLoginEmail } from './login-id.js'

// 저장소 계약(키 = 도메인, 값 = 메서드 이름 목록). mock·supabase 구현 양쪽을 이 표로 검사한다.
export const REPO_CONTRACT = {
  auth: ['currentUser', 'signIn', 'signOut'],
  members: ['me', 'list'],
  articles: ['listPublished', 'listMine'],
  interactions: ['counts', 'mine', 'listBookmarked', 'toggleLike', 'toggleBookmark'],
  sessions: ['list'],
  assignments: ['list'],
  submissions: ['listMine'],
  notices: ['listInternal'],
  collections: ['listMine', 'add', 'update', 'remove'],
  seminars: ['list'],
}

export function createSupabaseRepositories(backend) {
  const uid = () => backend.auth.getSession()?.user?.id || null

  // 켜기 = insert, 끄기 = 본인 행만 remove(화이트리스트 테이블). 반환 = 적용된 상태(boolean).
  async function toggleRow(table, articleId, on) {
    const id = uid()
    if (!id) throw new Error('로그인 필요')
    if (on) await backend.db.insert(table, { member_id: id, article_id: articleId })
    else await backend.db.remove(table, { member_id: id, article_id: articleId })
    return on
  }

  return {
    auth: {
      currentUser: () => backend.auth.getSession()?.user || null,
      // 입력 = 학번(§0-4). '@' 포함이면 이메일 그대로 — 변환 규칙 = login-id.js
      signIn: (loginId, password) => backend.auth.signIn(toLoginEmail(loginId), password),
      signOut: () => backend.auth.signOut(),
    },
    members: {
      // 로그인 본인 프로필(이름·역할). 학번·전공은 member_private — 여기서 조회하지 않는다(P5).
      async me() {
        const id = uid()
        if (!id) return null
        const rows = await backend.db.select('members', { filters: { id }, limit: 1 })
        return rows?.[0] || null
      },
      // 명단은 members_public 뷰 경유(학번·전공 컬럼 자체가 없음 — P5 구조적 보장)
      list: () => backend.db.select('members_public', { order: '이름.asc' }),
    },
    articles: {
      listPublished: () => backend.db.select('articles', { filters: { 상태: '게재' }, order: '게재일.desc' }),
      async listMine() {
        const id = uid()
        if (!id) return []
        return backend.db.select('articles', { filters: { 작성자: id }, order: 'created_at.desc' })
      },
    },
    // 북마크·좋아요(D3) — 열람은 공개, 상호작용은 로그인 멤버.
    // 총계는 뷰(article_interaction_counts)에서 온다: 익명도 숫자만 읽고 누가 눌렀는지는 못 본다(0003).
    interactions: {
      counts: () => backend.db.select('article_interaction_counts'),
      async mine() {
        const id = uid()
        if (!id) return { likes: [], bookmarks: [] }
        const [likes, bookmarks] = await Promise.all([
          backend.db.select('article_likes', { columns: 'article_id', filters: { member_id: id } }),
          backend.db.select('article_bookmarks', { columns: 'article_id', filters: { member_id: id } }),
        ])
        return {
          likes: (likes || []).map((r) => r.article_id),
          bookmarks: (bookmarks || []).map((r) => r.article_id),
        }
      },
      // 워크스페이스 컬렉션 탭용 — 북마크한 기사의 표시 정보까지 한 번에(PostgREST 임베드).
      async listBookmarked() {
        const id = uid()
        if (!id) return []
        return backend.db.select('article_bookmarks', {
          columns: 'article_id,created_at,articles(슬러그,제목,게재일,성격)',
          filters: { member_id: id },
          order: 'created_at.desc',
        })
      },
      toggleLike: (articleId, on) => toggleRow('article_likes', articleId, on),
      toggleBookmark: (articleId, on) => toggleRow('article_bookmarks', articleId, on),
    },
    sessions: {
      list: () => backend.db.select('sessions', { order: '회차.asc' }),
    },
    assignments: {
      list: () => backend.db.select('assignments', { order: 'created_at.desc' }),
    },
    submissions: {
      async listMine() {
        const id = uid()
        if (!id) return []
        return backend.db.select('submissions', { filters: { member_id: id }, order: '제출일시.desc' })
      },
    },
    notices: {
      listInternal: () => backend.db.select('notices', { order: 'created_at.desc' }),
    },
    collections: {
      async listMine() {
        const id = uid()
        if (!id) return []
        return backend.db.select('collections', { filters: { member_id: id }, order: 'created_at.desc' })
      },
      async add({ url, 메모 = '' }) {
        const id = uid()
        if (!id) throw new Error('로그인 필요')
        const rows = await backend.db.insert('collections', { member_id: id, url, 메모 })
        return rows?.[0] || null
      },
      // 본인 행만 — 필터에 member_id를 함께 걸어 RLS 이전 단계에서도 남의 행에 닿지 않는다.
      async update(rowId, patch) {
        const id = uid()
        if (!id) throw new Error('로그인 필요')
        const rows = await backend.db.update('collections', { id: rowId, member_id: id }, patch)
        return rows?.[0] || null
      },
      async remove(rowId) {
        const id = uid()
        if (!id) throw new Error('로그인 필요')
        await backend.db.remove('collections', { id: rowId, member_id: id })
        return rowId
      },
    },
    seminars: {
      list: () => backend.db.select('seminars', { order: '회차.desc' }),
    },
  }
}
