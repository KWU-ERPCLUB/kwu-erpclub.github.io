// 목 시드 데이터(mock.js 분할 — 300줄 규격, 2026-08-07 postings 추가로 초과되어 분리).
// 실배포 데이터와 무관한 합성값만 둔다(실명·실값 금지). 소비처 = mock.js 1곳.

export const SEED = {
  members: [
    { id: 'mock-staff', 이름: '운영진 A', role: '운영진', 학번: '2020000001', 자기소개: '샘플 소개', 관심사: ['자동화'], 가입일: '2026-09-01' },
    { id: 'mock-member', 이름: '스터디원 B', role: '스터디원', 학번: '2020000002', 자기소개: '샘플 소개', 관심사: ['에이전트'], 가입일: '2026-09-01' },
  ],
  articles: [
    { id: 'mock-a1', 슬러그: 'sample-published', 제목: '샘플 게재 기사', 설명: '목 데이터', 성격: '트렌드', 주제: '에이전트', 상태: '게재', 작성자: 'mock-staff', 게재일: '2026-09-10' },
    { id: 'mock-a2', 슬러그: 'sample-draft', 제목: '샘플 초안', 설명: '목 데이터', 성격: '심층 분석', 주제: '시장·생태계', 상태: '초안', 작성자: 'mock-member', 게재일: null },
  ],
  member_private: [
    { member_id: 'mock-staff', 전공: '샘플학부' },
    { member_id: 'mock-member', 전공: '샘플학부' },
  ],
  sessions: [{ id: 'mock-s1', 회차: 1, 날짜: '2026-09-08', 제목: '샘플 세션', 설명: '목 데이터' }],
  events: [{ id: 'mock-e1', 제목: '샘플 모임', 날짜: '2026-09-12', 시간: '19:00', 설명: '목 데이터', 종류: '일정' }],
  postings: [
    { id: 'mock-p1', 제목: '샘플 공모전', 종류: '공모전', 주최: '샘플 주최', url: 'https://example.com/contest', 접수시작: '2026-09-01', 접수마감: '2026-09-20', 시험일: null, 코멘트: '목 데이터 — 데이터 분석 트랙', 고정: false },
    { id: 'mock-p2', 제목: '샘플 자격시험', 종류: '자격시험', 주최: '샘플 기관', url: 'https://example.com/exam', 접수시작: '2026-09-05', 접수마감: '2026-09-09', 시험일: '2026-10-11', 코멘트: '목 데이터 — 접수창 5일 주의', 고정: true },
    { id: 'mock-p3', 제목: '샘플 상시 채용', 종류: '채용', 주최: '샘플 회사', url: 'https://example.com/job', 접수시작: null, 접수마감: null, 시험일: null, 코멘트: '목 데이터 — 상시 항목', 고정: false },
  ],
  flow_weeks: [
    { id: 'mock-f1', 주차: '9월 1주', 시작일: '2026-09-07', 제목: '샘플 킥오프', 내용: '목 데이터' },
    { id: 'mock-f2', 주차: '9월 2주', 시작일: '2026-09-14', 제목: '샘플 다음 주', 내용: '' },
  ],
  session_materials: [{ id: 'mock-m1', session_id: 'mock-s1', 제목: '샘플 자료', url: 'https://example.com/deck' }],
  assignments: [{ id: 'mock-h1', session_id: 'mock-s1', 제목: '샘플 과제', 마감: null }],
  submissions: [{ id: 'mock-sub1', assignment_id: 'mock-h1', member_id: 'mock-member', url: 'https://example.com/sample', 메모: '' }],
  notices: [{ id: 'mock-n1', 제목: '샘플 공지', 본문: '목 데이터', 내부여부: true }],
  collections: [{ id: 'mock-c1', member_id: 'mock-member', url: 'https://example.com/scrap', 메모: '샘플 스크랩' }],
  article_likes: [{ member_id: 'mock-member', article_id: 'mock-a1' }],
  article_bookmarks: [{ member_id: 'mock-member', article_id: 'mock-a1' }],
  seminars: [{ id: 'mock-sem1', 회차: 1, 날짜: '2026-09-20', 제목: '샘플 세미나', 유형: '인지', 공개여부: true }],
  applications: [
    { id: 'mock-app1', 이름: '지원자 C', 학번: '2023000003', 전공: '샘플학부', 전화번호: '010-0000-0000', 써본ai: '샘플 도구', 관심주제: '샘플 주제', created_at: '2026-08-25T09:00:00Z' },
  ],
}
