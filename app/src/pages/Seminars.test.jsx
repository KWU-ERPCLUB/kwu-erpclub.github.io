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

test('SeminarDetail 인지 — 목차 없이 리드 + 본문 + 다크 밴드', () => {
  const cog = { slug: 'y', title: '개념', author: '김', date: '2026-10-01', 회차: '4', 유형: '인지', body: '개론 리드.\n\n본문 이어짐.' }
  const html = flat(<SeminarDetail s={cog} onBack={() => {}} />)
  expect(html).toContain('sem-ed-band') // 다크 밴드는 유형 무관 상시
  expect(html).toContain('4회 · 인지')
  expect(html).toContain('개론 리드') // 리드
  expect(html).toContain('본문 이어짐') // 본문
  expect(html).not.toContain('sem-ed-toc') // 인지 = 목차 없음
})

test('페이지 구조 — 목록(타임라인 소개 헤드·필터 바) 상시 렌더(콘텐츠·시점 무관)', () => {
  const html = renderToString(<Seminars />)
  expect(html).toContain('sem-head') // 소개 page-head 골격
  expect(html).toContain('SEMINARS') // 눈썹
  expect(html).toContain('sem-filter-bar') // 필터 바
})
