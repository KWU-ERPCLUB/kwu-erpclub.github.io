// 저장소 계층 — 화면이 소비하는 유일한 데이터 인터페이스(SPEC §1 "저장소 모듈 경유만").
// 여기서 정의한 메서드 집합 = 목 저장소(mock.js)와 동일해야 한다(계약 테스트가 강제).
// 실제 권한 판정은 서버 RLS(0002_rls.sql)가 한다 — 여기 필터는 편의일 뿐 방어선이 아니다.

// 저장소 계약(키 = 도메인, 값 = 메서드 이름 목록). mock·supabase 구현 양쪽을 이 표로 검사한다.
export const REPO_CONTRACT = {
  auth: ['currentUser', 'signIn', 'signOut'],
  members: ['me', 'list'],
  articles: ['listPublished', 'listMine'],
  sessions: ['list'],
  assignments: ['list'],
  submissions: ['listMine'],
  notices: ['listInternal'],
  collections: ['listMine', 'add'],
  seminars: ['list'],
}

export function createSupabaseRepositories(backend) {
  const uid = () => backend.auth.getSession()?.user?.id || null

  return {
    auth: {
      currentUser: () => backend.auth.getSession()?.user || null,
      signIn: (email, password) => backend.auth.signIn(email, password),
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
    },
    seminars: {
      list: () => backend.db.select('seminars', { order: '회차.desc' }),
    },
  }
}
