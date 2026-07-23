import { expect, test } from 'vitest'
import { renderToString } from 'react-dom/server'
import Seminars, { splitSeminarBody, NextHero, PastItem, NextEmpty } from './Seminars.jsx'

const noop = () => {}
// SSR은 인접 표현식 사이에 <!-- --> 마커를 넣음 — 텍스트 조각 검증 전 제거.
const flat = (node) => renderToString(node).replace(/<!-- -->/g, '')

test('디자인된 빈 상태(NextEmpty 단위) — 무엇이 쌓이는지 + 기고 방법', () => {
  // 실콘텐츠 폴더에 결합하지 않는 단위 렌더(CI가 콘텐츠 증가·날짜 경과에 깨지지 않게 — 2026-07-24 회귀 교훈)
  const html = renderToString(<NextEmpty />)
  expect(html).toContain('다음 세미나 준비 중')
  expect(html).toContain('content/세미나/') // 기고 방법 안내
  expect(html).toContain('NEXT') // 예정 슬롯 눈썹
})

test('페이지 구조 — 눈썹 + NEXT 슬롯(히어로 또는 빈 상태) 상시 존재(콘텐츠·시점 무관)', () => {
  const html = renderToString(<Seminars />)
  expect(html).toContain('SEMINARS') // 눈썹 인덱스(§3-1)
  expect(html).toContain('sem-hero') // NextHero·NextEmpty 공통 클래스
})

test('NEXT 히어로 — 제목·리드 발췌·메타(일시·장소·발제자)·회차·유형 칩', () => {
  const s = {
    slug: 'x', title: 'RAG 실습', author: '홍길동', date: '2026-09-01',
    회차: '3', 유형: '실습', 장소: '새빛관 501호',
    body: '검색증강생성으로 사내 문서 질의응답 구축.\n\n## 준비\n환경 세팅',
  }
  const html = flat(<NextHero s={s} onOpen={noop} />)
  expect(html).toContain('RAG 실습')
  expect(html).toContain('검색증강생성') // 본문 첫 단락 발췌 리드
  expect(html).toContain('2026-09-01')
  expect(html).toContain('새빛관 501호') // 장소
  expect(html).toContain('발제 홍길동')
  expect(html).toContain('3회')
  expect(html).toContain('사전 준비 확인') // ## 준비 있으므로 prep 링크
})

test('NEXT 히어로 — 준비 헤딩 없으면 사전 준비 링크 없음', () => {
  const s = { slug: 'y', title: '개념 세미나', author: '김', date: '2026-10-01', 회차: '4', 유형: '인지', body: '자유 본문.' }
  const html = renderToString(<NextHero s={s} onOpen={noop} />)
  expect(html).not.toContain('사전 준비 확인')
})

test('아코디언 렌더 — 요점 불릿 + 슬라이드 링크 + 자세히', () => {
  const s = {
    slug: 'z', title: '지난 실습', author: '이', date: '2026-06-01', 회차: '2', 유형: '실습',
    요점: ['프롬프트 체인 설계', '평가셋 구성'], 슬라이드: 'https://slides.example/2',
    body: '서문.\n\n## 준비\n세팅',
  }
  const html = flat(<PastItem s={s} onOpen={noop} />)
  expect(html).toContain('<details')
  expect(html).toContain('2회 · 지난 실습')
  expect(html).toContain('프롬프트 체인 설계') // 요점 불릿
  expect(html).toContain('평가셋 구성')
  expect(html).toContain('https://slides.example/2') // 슬라이드 링크
  expect(html).toContain('자세히')
})

test('아코디언 렌더 — 요점 없으면 본문 발췌 1줄', () => {
  const s = { slug: 'w', title: '요약없음', author: '박', date: '2026-05-01', 회차: '1', 유형: '인지', body: '이 세미나는 에이전트 개론을 다룸.' }
  const html = renderToString(<PastItem s={s} onOpen={noop} />)
  expect(html).toContain('에이전트 개론')
})

test('본문 3블록 분할 — ## 헤딩 기준', () => {
  const body = '서문 문장\n\n## 준비\n환경 세팅\n\n## 진행\n실습 단계\n\n## 재현 가이드\n혼자 따라하기'
  const { intro, sections } = splitSeminarBody(body)
  expect(intro).toBe('서문 문장')
  expect(sections['준비']).toBe('환경 세팅')
  expect(sections['진행']).toBe('실습 단계')
  expect(sections['재현 가이드']).toBe('혼자 따라하기')
})

test('헤딩 없는 본문 — intro만', () => {
  const { intro, sections } = splitSeminarBody('그냥 본문')
  expect(intro).toBe('그냥 본문')
  expect(Object.keys(sections)).toEqual([])
})
