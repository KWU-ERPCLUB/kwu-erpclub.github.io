import { expect, test } from 'vitest'
import { renderToString } from 'react-dom/server'
import Labs from './Labs.jsx'

test('실습 빈 상태 문구 렌더', () => {
  const html = renderToString(<Labs />)
  expect(html).toContain('아직 실습 가이드가 없다. 세미나 실습 회차의 재현 절차가 여기 쌓인다.')
})
