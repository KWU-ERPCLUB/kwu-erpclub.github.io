import { expect, test } from 'vitest'
import { renderToString } from 'react-dom/server'
import Seminars, { splitSeminarBody, splitLead, SeminarDetail, NextHero, PastRow, NextEmpty } from './Seminars.jsx'

const noop = () => {}
// SSR은 인접 표현식 사이에 <!-- --> 마커를 넣음 — 텍스트 조각 검증 전 제거.
const flat = (node) => renderToString(node).replace(/<!-- -->/g, '')

test('디자인된 빈 상태(NextEmpty 단위) — 무엇이 쌓이는지 + 기고 방법', () => {
  // 실콘텐츠 폴더에 결합하지 않는 단위 렌더(CI가 콘텐츠 증가·날짜 경과에 깨지지 않게)
  const html = renderToString(<NextEmpty />)
  expect(html).toContain('다음 세미나 준비 중')
  expect(html).toContain('content/세미나/') // 기고 방법 안내
  expect(html).toContain('NEXT') // 예정 슬롯 눈썹
})

test('페이지 구조 — 풀블리드 NEXT 밴드(히어로 또는 빈 상태) 상시 존재(콘텐츠·시점 무관)', () => {
  const html = renderToString(<Seminars />)
  expect(html).toContain('sem-next') // NextHero·NextEmpty 공통 밴드 클래스
  expect(html).toContain('NEXT') // 눈썹
})

test('NEXT 히어로 — 초대형 타이틀·리드·메타·칩 (D-day 비표기, 2026-07-25 폐지)', () => {
  const s = {
    slug: 'x', title: 'RAG 실습', author: '홍길동', date: '2026-09-01',
    회차: '3', 유형: '실습', 장소: '새빛관 501호',
    body: '검색증강생성으로 사내 문서 질의응답 구축.\n\n## 준비\n환경 세팅\n\n## 진행\n실습 단계\n\n## 재현 가이드\n따라하기',
  }
  const html = flat(<NextHero s={s} onOpen={noop} />)
  expect(html).toContain('sem-next') // 풀블리드 밴드
  expect(html).not.toContain('sem-dday') // D-day 열 폐지
  expect(html).not.toContain('개최까지')
  expect(html).toContain('sem-next-title') // 초대형 타이틀
  expect(html).toContain('RAG 실습')
  expect(html).toContain('검색증강생성') // 본문 첫 단락 발췌 리드
  expect(html).toContain('2026-09-01')
  expect(html).toContain('새빛관 501호') // 장소
  expect(html).toContain('발제 홍길동')
  expect(html).toContain('3회')
  expect(html).toContain('사전 준비 필요') // ## 준비 있으므로 prep 배지
})

test('NEXT 히어로 — 구성 미리보기 3칸(번호·헤딩·섹션 발췌)', () => {
  const s = {
    slug: 'x', title: '당일 실습', author: '홍', date: '2026-09-01', 회차: '3', 유형: '실습',
    body: '서문.\n\n## 준비\n노트북 지참\n\n## 진행\n에이전트 실행\n\n## 재현 가이드\n혼자 따라하기 절차',
  }
  const html = flat(<NextHero s={s} onOpen={noop} />)
  expect(html).toContain('sem-toc-preview') // 구성 미리보기 목차
  expect(html).toContain('준비') // 헤딩 1
  expect(html).toContain('노트북 지참') // 준비 섹션 발췌
  expect(html).toContain('재현 가이드') // 헤딩 3
  expect(html).toContain('혼자 따라하기') // 재현 섹션 발췌
})

test('NEXT 히어로 — 인지형은 구성 미리보기·prep 배지 없음(리드만)', () => {
  const s = { slug: 'y', title: '개념 세미나', author: '김', date: '2026-10-01', 회차: '4', 유형: '인지', body: '자유 본문.' }
  const html = flat(<NextHero s={s} onOpen={noop} />)
  expect(html).not.toContain('sem-toc-preview') // 인지 = 구성 미리보기 없음
  expect(html).not.toContain('사전 준비 필요') // 준비 헤딩 없음
})

test('지난 세미나 번호 카드 — 초대형 회차 번호 + 요점 불릿 + 슬라이드 + 자세히', () => {
  const s = {
    slug: 'z', title: '지난 실습', author: '이', date: '2026-06-01', 회차: '2', 유형: '실습',
    요점: ['프롬프트 체인 설계', '평가셋 구성'], 슬라이드: 'https://slides.example/2',
    body: '서문.\n\n## 준비\n세팅',
  }
  const html = flat(<PastRow s={s} onOpen={noop} />)
  expect(html).toContain('sem-row') // 번호 카드(아코디언 폐지)
  expect(html).not.toContain('<details') // 아코디언 제거 확인
  expect(html).toContain('sem-row-no') // 초대형 회차 번호
  expect(html).toContain('02') // 회차 2 → 01/02 패딩
  expect(html).toContain('지난 실습')
  expect(html).toContain('프롬프트 체인 설계') // 요점 불릿
  expect(html).toContain('평가셋 구성')
  expect(html).toContain('https://slides.example/2') // 슬라이드 링크
  expect(html).toContain('자세히')
})

test('지난 세미나 번호 카드 — 요점 없으면 본문 발췌 1줄', () => {
  const s = { slug: 'w', title: '요약없음', author: '박', date: '2026-05-01', 회차: '1', 유형: '인지', body: '이 세미나는 에이전트 개론을 다룸.' }
  const html = renderToString(<PastRow s={s} onOpen={noop} />)
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

// ── 상세 = 컬러(다크) 헤더 밴드 ──
test('splitLead — 첫 단락=리드, 나머지=rest', () => {
  expect(splitLead('첫 문장.\n\n둘째 단락.\n\n셋째.')).toEqual({ lead: '첫 문장.', rest: '둘째 단락.\n\n셋째.' })
  expect(splitLead('한 단락뿐')).toEqual({ lead: '한 단락뿐', rest: '' })
  expect(splitLead('')).toEqual({ lead: '', rest: '' })
})

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
  expect(html).toContain('재현 가이드') // 3블록 타이틀
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
