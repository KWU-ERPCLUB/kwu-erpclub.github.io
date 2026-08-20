// 기고 서식 확장 — 요약·수치 컨테이너·표 렌더 검증
import { describe, it, expect } from 'vitest'
import { renderToString } from 'react-dom/server'
import Markdown from './Markdown.jsx'

describe('Markdown 서식 확장', () => {
  it('::: 요약 블록 = 핵심 요약 라벨 + 내부 목록 렌더', () => {
    const html = renderToString(<Markdown body={'::: 요약\n- 첫 포인트\n- 둘째 포인트\n:::\n\n본문 문단.'} />)
    expect(html).toContain('md-summary')
    expect(html).toContain('핵심 요약')
    expect(html).toContain('첫 포인트')
    expect(html).toContain('본문 문단.')
  })

  it('::: 수치 블록 = 숫자·설명·출처 3요소 카드 렌더', () => {
    const html = renderToString(<Markdown body={'::: 수치\n88% | AI 상시 사용 조직 | McKinsey\n23% | 확장 단계 조직\n:::'} />)
    expect(html).toContain('md-stats')
    expect(html).toContain('88%')
    expect(html).toContain('AI 상시 사용 조직')
    expect(html).toContain('md-stat-src')
    expect(html).toContain('McKinsey')
  })

  it('수치 블록 값의 HTML 특수문자 = 이스케이프', () => {
    const html = renderToString(<Markdown body={'::: 수치\n<b>1 | 설명 | 출처\n:::'} />)
    expect(html).not.toContain('<b>1')
    expect(html).toContain('&lt;b&gt;1')
  })

  it('::: 용어 블록 = 용어 설명 라벨 + 번호 목록', () => {
    const html = renderToString(<Markdown body={'::: 용어\n에이전틱 AI | 여러 단계 작업을 알아서 처리하는 AI\nSaaS | 구독형 소프트웨어\n:::'} />)
    expect(html).toContain('md-terms')
    expect(html).toContain('용어 설명')
    expect(html).toContain('에이전틱 AI')
    expect(html).toContain('구독형 소프트웨어')
  })

  it('::: 출처 블록 = 링크 목록, http 아닌 URL은 링크 미생성', () => {
    const html = renderToString(<Markdown body={'::: 출처\n원문 A | https://example.com/a | 비고\n원문 B | javascript:alert(1)\n:::'} />)
    expect(html).toContain('md-sources')
    expect(html).toContain('리서치 출처')
    expect(html).toContain('href="https://example.com/a"')
    expect(html).toContain('비고')
    expect(html).not.toContain('javascript:alert')
  })

  it('::: 로드맵 블록 = 날짜·제목·한줄 타임라인 렌더', () => {
    const html = renderToString(<Markdown body={'::: 로드맵\n06-26 | 스터디 시작 | 운영 모델 확정\n06-28 | 보드 탄생\n:::'} />)
    expect(html).toContain('md-roadmap')
    expect(html).toContain('06-26')
    expect(html).toContain('스터디 시작')
    expect(html).toContain('운영 모델 확정')
    expect(html).toContain('보드 탄생')
  })

  it('::: 결정 블록 = 문제→결정·근거 카드 렌더 + 이스케이프', () => {
    const html = renderToString(<Markdown body={'::: 결정\n수기 집계인가 | 웹앱 제작 | 매주 걷는 비용 제거\n<b>x | y\n:::'} />)
    expect(html).toContain('md-decisions')
    expect(html).toContain('수기 집계인가')
    expect(html).toContain('웹앱 제작')
    expect(html).toContain('매주 걷는 비용 제거')
    expect(html).not.toContain('<b>x')
    expect(html).toContain('&lt;b&gt;x')
  })

  it('::: 결정 4번째 칸(폐기한 대안) = 선택 렌더, 3칸 기존 형식은 무변경(하위호환)', () => {
    const four = renderToString(<Markdown body={'::: 결정\n두 벌 운영인가 | 제자리 UPDATE | 표기만 바뀜 | 개정판 별도 시드\n:::'} />)
    expect(four).toContain('md-dc-dropped')
    expect(four).toContain('개정판 별도 시드')
    const three = renderToString(<Markdown body={'::: 결정\n수기 집계인가 | 웹앱 제작 | 매주 걷는 비용 제거\n:::'} />)
    expect(three).not.toContain('md-dc-dropped')
  })

  it('::: 로드맵 ⭐ 접두 = 대형 분기점 마커 클래스 + 별 제거된 제목', () => {
    const html = renderToString(<Markdown body={'::: 로드맵\n06-26 | 스터디 시작\n07-01 | ⭐콘텐츠 원천 재구축 | 전량 폐기\n:::'} />)
    expect(html).toContain('md-rm-major')
    expect(html).toContain('콘텐츠 원천 재구축')
    expect(html).not.toContain('⭐콘텐츠')
  })

  // 폐지된 블록(2026-08-20 — 프로젝트 md 상세와 함께 삭제): 미지의 kind는 렌더러를 타지 않고 평문으로 남는다.
  it('폐지 블록(비교·분기점) = 전용 렌더 없음', () => {
    const cmp = renderToString(<Markdown body={'::: 비교\n/img/a.png | 개편 전\n:::'} />)
    expect(cmp).not.toContain('md-compare')
    const br = renderToString(<Markdown body={'::: 분기점\n문제 | x\n결정 | y\n:::'} />)
    expect(br).not.toContain('md-branch')
  })

  it('GFM 표 = table 렌더', () => {
    const html = renderToString(<Markdown body={'| 항목 | 값 |\n|---|---|\n| 도입 | 88% |'} />)
    expect(html).toContain('<table>')
    expect(html).toContain('도입')
  })

  it('컨테이너 밖 일반 마크다운 = 기존과 동일(회귀 방지)', () => {
    const html = renderToString(<Markdown body={'## 소제목\n\n**강조** 문단'} />)
    expect(html).toContain('<h2>소제목</h2>')
    expect(html).toContain('<strong>강조</strong>')
  })
})
