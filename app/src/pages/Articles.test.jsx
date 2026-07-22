import { expect, test } from 'vitest'
import { renderToString } from 'react-dom/server'
import Articles from './Articles.jsx'

test('기고 목록에 예시 기고 제목 렌더', () => {
  const html = renderToString(<Articles />)
  expect(html).toContain('2026 AI 트렌드')
})
