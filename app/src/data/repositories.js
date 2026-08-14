// 저장소 계층 — 화면이 소비하는 유일한 데이터 인터페이스(SPEC §1 "저장소 모듈 경유만").
// 여기서 정의한 메서드 집합 = 목 저장소(mock.js)와 동일해야 한다(계약 테스트가 강제).
// 실제 권한 판정은 서버 RLS(0002_rls.sql)가 한다 — 여기 필터는 편의일 뿐 방어선이 아니다.

import { toLoginEmail } from './login-id.js'

export const today = () => new Date().toISOString().slice(0, 10)

// 워크스페이스 기고분 슬러그 — 제목이 한글이라 URL 안전한 값을 날짜+난수로 만든다.
// md 발행분(파일명 스템)과 형태가 달라도 무방: 둘 다 unique 키 역할만 한다.
export const newSlug = () => `${today()}-ws-${Math.random().toString(36).slice(2, 8)}`

// 저장소 계약(키 = 도메인, 값 = 메서드 이름 목록). mock·supabase 구현 양쪽을 이 표로 검사한다.
export const REPO_CONTRACT = {
  auth: ['currentUser', 'signIn', 'signOut', 'updatePassword'],
  members: ['me', 'list', 'listPrivate', 'updateMe', 'setRole'],
  articles: ['listPublished', 'listMine', 'listPending', 'save', 'setStatus'],
  interactions: ['counts', 'mine', 'listBookmarked', 'toggleLike', 'toggleBookmark'],
  sessions: ['list', 'save'],
  notes: ['list', 'save'],
  events: ['list', 'save', 'remove'],
  postings: ['list', 'save', 'remove', 'listInterests', 'toggleInterest'],
  flow: ['list', 'save', 'remove'],
  materials: ['list', 'save'],
  assignments: ['list', 'save'],
  submissions: ['listMine', 'listAll', 'submit'],
  notices: ['listInternal', 'save'],
  collections: ['listMine', 'add', 'update', 'remove'],
  seminars: ['list'],
  applications: ['submit', 'list'],
}

export function createSupabaseRepositories(backend) {
  const uid = () => backend.auth.getSession()?.user?.id || null

  // 운영 콘텐츠 저장(공지·세션·자료·과제) 공통 — id 있으면 수정, 없으면 신규.
  // 권한 판정은 서버 RLS(*_write_staff)가 한다. 여기 코드는 운영진 여부를 묻지 않는다.
  const saveRow = (table) => async (row) => {
    const patch = { ...row }
    delete patch.id
    const rows = row.id
      ? await backend.db.update(table, { id: row.id }, patch)
      : await backend.db.insert(table, patch)
    return rows?.[0] || null
  }

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
      // 본인 비밀번호 변경(로그인 상태 전제 — 셀프 "찾기"는 비범위, 잊으면 운영진 재설정)
      updatePassword: (newPassword) => backend.auth.updatePassword(newPassword),
    },
    members: {
      // 로그인 본인 프로필(이름·역할). 학번·전공은 member_private — 여기서 조회하지 않는다(P5).
      async me() {
        const id = uid()
        if (!id) return null
        const rows = await backend.db.select('members', { filters: { id }, limit: 1 })
        return rows?.[0] || null
      },
      // 명단은 members_public 뷰 경유(전공 컬럼 자체가 없음 — P5 구조적 보장. 학번 = 로그인 ID로 포함)
      list: () => backend.db.select('members_public', { order: '이름.asc' }),
      // 전공 = member_private. RLS(본인 ∨ 운영진)가 거르므로 스터디원이 부르면 본인 1행만 온다.
      listPrivate: () => backend.db.select('member_private'),
      // 본인 프로필 수정 — 자기소개·관심사만 보낸다(role을 함께 보내면 members_update_self가 거부).
      async updateMe(patch) {
        const id = uid()
        if (!id) throw new Error('로그인 필요')
        const rows = await backend.db.update('members', { id }, patch)
        return rows?.[0] || null
      },
      // 역할 변경 = 운영진 정책(members_manage_staff)으로만 통과.
      async setRole(memberId, role) {
        const rows = await backend.db.update('members', { id: memberId }, { role })
        return rows?.[0] || null
      },
    },
    articles: {
      listPublished: () => backend.db.select('articles', { filters: { 상태: '게재' }, order: '게재일.desc' }),
      async listMine() {
        const id = uid()
        if (!id) return []
        return backend.db.select('articles', { filters: { 작성자: id }, order: 'created_at.desc' })
      },
      // 운영진 승인 대기함(§0-8). 스터디원이 호출하면 RLS가 빈 배열을 준다.
      listPending: () => backend.db.select('articles', { filters: { 상태: '승인대기' }, order: 'updated_at.desc' }),
      // 초안 저장·수정. 상태는 '초안'∨'승인대기'만 — '게재' 전환은 setStatus(운영진 정책)로만 간다.
      async save(draft) {
        const id = uid()
        if (!id) throw new Error('로그인 필요')
        const patch = { ...draft }
        delete patch.id
        if (draft.id) {
          const rows = await backend.db.update('articles', { id: draft.id, 작성자: id }, patch)
          return rows?.[0] || null
        }
        const rows = await backend.db.insert('articles', { ...patch, 작성자: id, 슬러그: draft['슬러그'] || newSlug() })
        return rows?.[0] || null
      },
      // 게재 전환 시 게재일이 비어 있으면 오늘로 채운다(제약 articles_published_needs_date).
      async setStatus(articleId, 상태) {
        const patch = { 상태 }
        if (상태 === '게재') patch['게재일'] = today()
        const rows = await backend.db.update('articles', { id: articleId }, patch)
        return rows?.[0] || null
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
          columns: 'article_id,created_at,articles(슬러그,제목,게재일,성격,설명,이미지)',
          filters: { member_id: id },
          order: 'created_at.desc',
        })
      },
      toggleLike: (articleId, on) => toggleRow('article_likes', articleId, on),
      toggleBookmark: (articleId, on) => toggleRow('article_bookmarks', articleId, on),
    },
    sessions: {
      list: () => backend.db.select('sessions', { order: '회차.asc' }),
      save: saveRow('sessions'),
    },
    // 세션 본문(0012) — 차시 상세(목표·진행). 멤버는 공개일 게이트(RLS notes_select_member), 미적용 = 빈 배열 강등.
    notes: {
      list: () => backend.db.select('session_notes', { order: 'created_at.asc' }).catch(() => []),
      save: saveRow('session_notes'),
    },
    // 스터디 흐름(0008) — 주차 기록. 테이블 미적용 = 빈 배열 강등(흐름 탭은 안내만).
    flow: {
      list: () => backend.db.select('flow_weeks', { order: '시작일.asc' }).catch(() => []),
      save: saveRow('flow_weeks'),
      async remove(rowId) {
        await backend.db.remove('flow_weeks', { id: rowId })
        return rowId
      },
    },
    // 운영 일정(0007) — 홈 캘린더 원천. 테이블 미적용(마이그레이션 전) = list가 빈 배열로 강등(홈은 과제·세션만 표시).
    events: {
      list: () => backend.db.select('events', { order: '날짜.asc' }).catch(() => []),
      save: saveRow('events'),
      // 삭제 = 운영진만(RLS events_write_staff) — 클라이언트 화이트리스트(supabase.js DELETABLE)에도 등재.
      async remove(rowId) {
        await backend.db.remove('events', { id: rowId })
        return rowId
      },
    },
    // 공고(0009) — 공모전·채용·자격시험 스크랩(공고 탭·홈 캘린더 합류). 미적용 = 빈 배열 강등(events와 동일).
    postings: {
      list: () => backend.db.select('postings', { order: 'created_at.desc' }).catch(() => []),
      save: saveRow('postings'),
      // 삭제 = 운영진만(RLS postings_write_staff) — 클라이언트 화이트리스트(supabase.js DELETABLE)에도 등재.
      async remove(rowId) {
        await backend.db.remove('postings', { id: rowId })
        return rowId
      },
      // 관심 공고(0013) — 본인 관심 posting_id 목록. 미적용 = 빈 배열 강등(공고 탭은 ★ 없이도 동작).
      async listInterests() {
        const id = uid()
        if (!id) return []
        return backend.db.select('posting_interests', { columns: 'posting_id', filters: { member_id: id } })
          .then((rows) => (rows || []).map((r) => r.posting_id))
          .catch(() => [])
      },
      // 켜기 = insert, 끄기 = 본인 행 remove(DELETABLE 등재). 반환 = 적용된 상태.
      async toggleInterest(postingId, on) {
        const id = uid()
        if (!id) throw new Error('로그인 필요')
        if (on) await backend.db.insert('posting_interests', { member_id: id, posting_id: postingId })
        else await backend.db.remove('posting_interests', { member_id: id, posting_id: postingId })
        return on
      },
    },
    // 세션 자료 = 링크 기반(M3). 파일 업로드(Storage)는 M4 — 파일경로 컬럼은 비워둔다.
    materials: {
      list: () => backend.db.select('session_materials', { order: 'created_at.asc' }),
      save: saveRow('session_materials'),
    },
    assignments: {
      list: () => backend.db.select('assignments', { order: 'created_at.desc' }),
      save: saveRow('assignments'),
    },
    submissions: {
      async listMine() {
        const id = uid()
        if (!id) return []
        return backend.db.select('submissions', { filters: { member_id: id }, order: '제출일시.desc' })
      },
      // 운영진 제출 현황 매트릭스용 — RLS(submissions_select_own_or_staff)가 거른다: 스터디원이 부르면 본인 행만.
      listAll: () => backend.db.select('submissions', { order: '제출일시.desc' }),
      // 과제×멤버 1건(unique) — 기존 제출이 있으면 id를 넘겨 수정한다(본인 행만).
      async submit({ id, assignment_id, url, 메모 = '' }) {
        const me = uid()
        if (!me) throw new Error('로그인 필요')
        const rows = id
          ? await backend.db.update('submissions', { id, member_id: me }, { url, 메모 })
          : await backend.db.insert('submissions', { assignment_id, member_id: me, url, 메모 })
        return rows?.[0] || null
      },
    },
    notices: {
      listInternal: () => backend.db.select('notices', { order: 'created_at.desc' }),
      save: saveRow('notices'),
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
    // /recruit 신청 폼(0006) — 제출 = 익명 허용(RLS applications_insert_anyone), 열람 = 운영진만.
    applications: {
      // return=minimal — 익명은 select 권한이 없어 representation 반환이 곧 실패이기 때문(0006 주석 참조).
      async submit(form) {
        await backend.db.insert('applications', form, { minimal: true })
        return true
      },
      // 운영진이 아니면 RLS가 0행을 준다(오류 아님 — 화면은 그대로 빈 목록).
      list: () => backend.db.select('applications', { order: 'created_at.desc' }),
    },
  }
}
