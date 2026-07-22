import { expect, test } from 'vitest'
import { renderToString } from 'react-dom/server'
import MembersPage from './MembersPage.jsx'

test('멤버 목록에 픽스처 프로필(신해원) 렌더', () => {
  const html = renderToString(<MembersPage />)
  expect(html).toContain('신해원')
})
