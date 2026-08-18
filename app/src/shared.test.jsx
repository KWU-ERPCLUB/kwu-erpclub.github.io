// 공개 헤더 — 워크스페이스 링크 상시 노출(오너 개정 2026-08-07: 링크가 없으면 로그인 화면 입구가 없다).
import { expect, test } from 'vitest'
import { renderToString } from 'react-dom/server'
import { SiteNav, PageHead, latestUpdated, SiteFooter } from './shared.jsx'
import pkg from '../package.json'

const flat = (node) => renderToString(node).replace(/<!-- -->/g, '')

test('헤더 = 공개 4탭 + 워크스페이스 상시 링크(폐지 페이지 링크 0)', () => {
  const html = flat(<SiteNav />)
  expect(html).toContain('href="/workspace/"')
  expect(html).toContain('WORKSPACE')
  expect(html).not.toContain('/about/') // about·log 폐지(IA 4차 2026-08-05)
  expect(html).not.toContain('/log/')
  for (const label of ['INSIGHTS', 'SEMINARS', 'PROJECTS', 'RECRUIT']) {
    expect(html).toContain(label)
  }
})

test('스킵 링크 = 문서 첫 요소·#main 대상(접근성 3차)', () => {
  const html = flat(<SiteNav />)
  expect(html.indexOf('skip-link')).toBeLessThan(html.indexOf('class="nav"'))
  expect(html).toContain('href="#main"')
  expect(html).toContain('본문 바로가기')
})

// 페이지 헤드 골격(4차 2026-08-06 외부 피드백) — 중앙 정렬 1열: 키커+h1+문장형 설명+메타+children.
test('PageHead = 중앙 키커+h1+설명+메타+children 골격(좌 레일 ■ 폐지)', () => {
  const html = flat(
    <PageHead label="INSIGHTS" title={<>AI <em>인사이트</em></>} sub="서브 문구" meta="최종 갱신 2026-08-05">
      <div className="extra-filter" />
    </PageHead>,
  )
  expect(html).toContain('pg-head')
  expect(html).not.toContain('pg-sq') // 좌 라벨 레일 ■ 폐지(4차)
  expect(html).toContain('>INSIGHTS<')
  expect(html).toContain('<em>인사이트</em>')
  expect(html).toContain('서브 문구')
  expect(html).toContain('최종 갱신 2026-08-05')
  expect(html).toContain('extra-filter') // 페이지 고유 부가 요소 = children
})

test('갱신일 메타 = 콘텐츠 최신 게재일 파생(없으면 null = 줄 생략)', () => {
  expect(latestUpdated([{ date: '2026-07-01' }, { date: '2026-08-04' }])).toBe('최종 갱신 2026-08-04')
  expect(latestUpdated([])).toBe(null)
  expect(latestUpdated([{ title: '날짜 없음' }])).toBe(null)
  // 메타 없으면 줄 자체가 렌더되지 않는다(하드코딩 날짜 금지)
  expect(flat(<PageHead label="X" title="제목" />)).not.toContain('pg-meta')
})

// 릴리스 체계 spec §6·§10 — 버전 원천은 package.json 한 곳. 화면 숫자가 그 값과 어긋나면 실패한다.
test('푸터 버전 = package.json 파생(하드코딩 금지)', () => {
  const html = flat(<SiteFooter />)
  expect(html).toContain('f-ver')
  expect(html).toContain(`v${pkg.version}`)
})
