// md ↔ DB 매핑 단일원천 (SPEC §0-6 "서빙 원천 = DB, md = 집필 포맷·백업").
// 두 방향을 한 파일에 둔다 — 한쪽만 고쳐서 어긋나는 사고를 막는다.
//   toDbRow   : frontmatter+본문 → articles 행 (scripts/sync-content-db.mjs)
//   fromDbRow : articles 행 → 화면이 쓰는 기사 객체 (pages/insights-source.js)
// 화면 객체의 키는 md 로더(content/loader.js) 출력과 같아야 한다 — 카드·상세 컴포넌트를 그대로 쓰기 위함.

// slug = 파일명 스템 = articles.슬러그 = 공개 URL ?p= 값.
export function toDbRow({ slug, data, body }) {
  return {
    슬러그: slug,
    제목: data.title,
    설명: data['설명'],
    본문: body,                       // md 원문 그대로(렌더러가 소비)
    성격: data['성격'],
    주제: data['주제'],
    상태: '게재',                     // md에 있다 = 이미 공개된 글(§4-3)
    작성자표기: data.author,
    게재일: data.date,
    시각: data['시각'] || null,
    source_url: data.source_url,
    source_name: data.source_name,
    태그: Array.isArray(data['태그']) ? data['태그'] : [],
    지금써먹기: data['지금써먹기'] === true,
    고정: data['고정'] === true,
    이미지: data['이미지'] || null,
    이미지설명: data['이미지설명'] || null,
  }
}

export function fromDbRow(row) {
  return {
    id: row.id,
    slug: row['슬러그'],
    title: row['제목'],
    author: row['작성자표기'] || row['작성자이름'] || '',
    date: (row['게재일'] || '').slice(0, 10),
    body: row['본문'] || '',
    '설명': row['설명'] || '',
    '성격': row['성격'],
    '주제': row['주제'],
    '시각': row['시각'] || undefined,
    '태그': Array.isArray(row['태그']) ? row['태그'] : [],
    '지금써먹기': row['지금써먹기'] === true,
    '고정': row['고정'] === true,
    '이미지': row['이미지'] || undefined,
    '이미지설명': row['이미지설명'] || undefined,
    source_url: row.source_url || '',
    source_name: row.source_name || '',
  }
}

// 목록 정렬 = 게재일 역순(md 로더와 동일 규칙). 같은 날짜면 시각 역순.
export function sortByDateDesc(list) {
  return [...list].sort((a, b) =>
    `${b.date} ${b['시각'] || ''}`.localeCompare(`${a.date} ${a['시각'] || ''}`))
}
