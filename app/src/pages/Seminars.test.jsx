import { expect, test } from 'vitest'
import { renderToString } from 'react-dom/server'
import Seminars, { SeminarDetail } from './Seminars.jsx'

// SSR은 인접 표현식 사이에 <!-- --> 마커를 넣음 — 텍스트 조각 검증 전 제거.
const flat = (node) => renderToString(node).replace(/<!-- -->/g, '')

const labSem = {
  slug: 'x', title: 'RAG 실습', author: '홍길동', date: '2026-09-01', 회차: '3', 유형: '실습',
  장소: '새빛관 501호', 슬라이드: 'https://slides/3',
  body: '검색증강생성으로 사내 문서 질의응답 구축.\n\n## 준비\n환경 세팅\n\n## 진행\n실습\n\n## 재현 가이드\n따라하기',
}

test('SeminarDetail 실습 — 다크 헤더 밴드(눈썹 회차·유형·대형 타이틀·리드·메타) + 목차 3앵커 + 번호 블록', () => {
  const html = flat(<SeminarDetail s={labSem} onBack={() => {}} />)
  expect(html).toContain('sem-ed-band') // 컬러(다크) 헤더 밴드
  expect(html).toContain('3회 · 실습') // 눈썹 회차·유형
  expect(html).toContain('sem-ed-title') // 대형 타이틀
  expect(html).toContain('검색증강생성') // 리드(서문)
  expect(html).toContain('새빛관 501호') // 메타
  expect(html).toContain('sem-ed-body') // 밴드 아래 흰 본문
  expect(html).toContain('sem-ed-toc') // 섹션 목차
  expect(html).toContain('#sec-0') // 앵커 링크
  expect(html).toContain('#sec-2')
  expect(html).toContain('id="sec-0"') // 블록 앵커 대상
  expect(html).toContain('01') // 번호 눈썹
  expect(html).toContain('재현 가이드') // 3블록 타이틀(실습 헤딩)
})

// 특강(2026-08-15) — 정규 차시 밖 단발 자료. 회차 대신 '특강' 라벨(목록 노드·상세 눈썹 둘 다).
test('특강 = 회차 번호 대신 특강 라벨 (상세 눈썹 + 목록 노드)', async () => {
  const sp = { slug: 'sp', title: '특강 자료', author: '김', date: '2026-07-25', 특강: true, 유형: '인지', body: '특강 리드.' }
  const html = flat(<SeminarDetail s={sp} onBack={() => {}} />)
  expect(html).toContain('특강 · 인지') // 눈썹 = 회차 없이 특강
  expect(html).not.toContain('undefined') // 회차 부재가 표시로 새지 않음
  const { SeminarRow } = await import('./SeminarsTimeline.jsx')
  const row = flat(<SeminarRow s={sp} today="2026-08-15" />)
  expect(row).toContain('is-sp') // 노드 축소 클래스
  expect(row).toContain('특강') // 번호 자리 라벨
})

test('SeminarDetail 인지 — 목차 없이 리드 + 본문 + 다크 밴드', () => {
  const cog = { slug: 'y', title: '개념', author: '김', date: '2026-10-01', 회차: '4', 유형: '인지', body: '개론 리드.\n\n본문 이어짐.' }
  const html = flat(<SeminarDetail s={cog} onBack={() => {}} />)
  expect(html).toContain('sem-ed-band') // 다크 밴드는 유형 무관 상시
  expect(html).toContain('4회 · 인지')
  expect(html).toContain('개론 리드') // 리드
  expect(html).toContain('본문 이어짐') // 본문
  expect(html).not.toContain('sem-ed-toc') // 인지 = 목차 없음
})

// v3.1 구조형 인지 세미나 픽스처("다루는 내용"+"출처"+말미 각주) — 실데이터 아님(주입).
const structuredSem = {
  slug: 'q', title: '질문에서 위임으로', author: 'bapzzi', date: '2026-07-25', 회차: '1', 유형: '인지',
  슬라이드: 'https://slides.example/s1', 발원기사: 'https://origin.example/a',
  body: [
    'AI 활용 구조를 3단으로 구분하는 인지 세미나.',
    '',
    '## 다루는 내용',
    '',
    '- 첫 항목 개론',
    '- 둘째 항목 심화',
    '',
    '## 출처',
    '',
    '- [출처 문서 A](https://src.example/a)',
    '- [출처 문서 B](https://src.example/b)',
    '',
    '수치는 2026-07-25 확인 기준.',
  ].join('\n'),
}

test('SeminarDetail 구조형 — 발제 블록 + "다루는 내용" 번호 목차 + 출처 행 + 각주, 슬라이드 버튼 부재', () => {
  const html = flat(<SeminarDetail s={structuredSem} onBack={() => {}} />)
  // ① 발제 블록 — 모노그램(author 첫 글자 대문자) + 발제 author + date
  expect(html).toContain('sem-ed-byline')
  expect(html).toContain('sem-ed-mono')
  // 표시명 = 계정 id가 아니라 실명(2026-08-15 오너) — 매핑 = content/authors.js
  expect(html).toContain('>신<') // 'bapzzi' → '신해원' → 모노그램 '신'
  expect(html).toContain('발제 신해원')
  expect(html).not.toContain('bapzzi')
  // ② "다루는 내용" 번호 목차 — 01/02 + 불릿 텍스트
  expect(html).toContain('sem-ed-outline')
  expect(html).toContain('sem-ed-outline-num')
  expect(html).toContain('01')
  expect(html).toContain('02')
  expect(html).toContain('첫 항목 개론')
  // ③ 출처 행 — 외부 링크 새 탭 + 각주
  expect(html).toContain('sem-ed-src-row')
  expect(html).toContain('https://src.example/a')
  expect(html).toContain('target="_blank"')
  expect(html).toContain('출처 문서 A')
  expect(html).toContain('sem-ed-footnote')
  expect(html).toContain('수치는 2026-07-25 확인 기준')
  // 슬라이드 버튼 제거 — btn-2nd·슬라이드 URL 부재 / 발원기사 링크는 유지 / 실습 목차(sem-ed-toc)도 아님
  expect(html).not.toContain('btn-2nd')
  expect(html).not.toContain('https://slides.example/s1')
  expect(html).not.toContain('sem-ed-toc')
  expect(html).toContain('발원 기사')
  expect(html).toContain('https://origin.example/a')
})

// 상세 최상단 표지(2026-08-14 오너) — 썸네일 + pdf(∨슬라이드) 있으면 클릭형 표지, 새 탭.
test('SeminarDetail 표지 — 썸네일·pdf 있으면 최상단 표지 링크(pdf 우선·새 탭), 썸네일 없으면 비표시', () => {
  const withCover = flat(<SeminarDetail s={{ ...labSem, 썸네일: ['/img/세미나/cover-s3.png'], pdf: '/pdf/세미나/b.pdf' }} onBack={() => {}} />)
  expect(withCover).toContain('sem-ed-cover')
  expect(withCover).toContain('/img/세미나/cover-s3.png')
  expect(withCover).toContain('/pdf/세미나/b.pdf') // pdf 우선
  expect(withCover).toContain('클릭 = 발표자료 PDF 새 탭 열기') // 개조식 + pdf 있을 때만 PDF 표기
  const noThumb = flat(<SeminarDetail s={labSem} onBack={() => {}} />)
  expect(noThumb).not.toContain('sem-ed-cover')
})

test('페이지 구조 — 목록(헤드 + 세로 타임라인) 상시 렌더(콘텐츠·시점 무관)', () => {
  const html = renderToString(<Seminars />)
  expect(html).toContain('pg-head') // 소개 page-head 골격(3차 통일 = 공용 PageHead)
  expect(html).toContain('SEMINARS') // 눈썹
  expect(html).toContain('sem-tl-spine') // v5 세로 타임라인(2026-08-15) — 구 필터 바 폐지
  expect(html).not.toContain('sem-filter-bar')
})
