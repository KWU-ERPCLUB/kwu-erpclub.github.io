import { expect, test } from 'vitest'
import { renderToString } from 'react-dom/server'
import ArticleActions from './ArticleActions.jsx'
import ArticleDetail from './ArticleDetail.jsx'

// api = useInteractions() 형태의 최소 스텁(네트워크 0 — P4)
const api = (over = {}) => ({
  enabled: true, loggedIn: false, notice: '',
  countsOf: () => ({ 좋아요수: 3, 북마크수: 1 }),
  liked: () => false, bookmarked: () => false, toggle: () => {},
  ...over,
})

test('비로그인 = 카운트만 표시, 눌린 상태 아님', () => {
  const html = renderToString(<ArticleActions articleId="a1" api={api()} />)
  expect(html).toContain('좋아요')
  expect(html).toContain('북마크')
  expect(html).toContain('>3<')
  expect(html).toContain('aria-pressed="false"')
  expect(html).not.toContain('art-act on')
})

test('비로그인 클릭 안내 문구 = 워크스페이스 경로 제시', () => {
  const html = renderToString(<ArticleActions articleId="a1" api={api({ notice: '북마크·좋아요 = 워크스페이스 로그인 후 이용(/workspace/)' })} />)
  expect(html).toContain('워크스페이스 로그인 후 이용')
  expect(html).toContain('/workspace/')
})

test('로그인·토글 상태 = aria-pressed true + on 클래스', () => {
  const html = renderToString(
    <ArticleActions articleId="a1" api={api({ loggedIn: true, liked: () => true, bookmarked: () => true })} />,
  )
  expect(html).toContain('aria-pressed="true"')
  expect(html.match(/art-act on/g)).toHaveLength(2)
})

test('백엔드 미설정(md 폴백) = 상호작용 줄 자체가 없음(죽은 버튼 금지)', () => {
  expect(renderToString(<ArticleActions articleId="a1" api={api({ enabled: false })} />)).toBe('')
  const cur = { slug: 's', title: 't', author: 'A', date: '2026-08-01', body: 'b', 성격: '트렌드' }
  const detail = renderToString(<ArticleDetail cur={cur} all={[cur]} onOpen={() => {}} onBack={() => {}} />)
  expect(detail).not.toContain('art-actions')
  expect(detail).toContain('art-doc-head')   // 상세 셸 마크업은 불변
})
