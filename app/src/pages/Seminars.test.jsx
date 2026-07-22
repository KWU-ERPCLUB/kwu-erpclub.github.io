import { expect, test } from 'vitest'
import { renderToString } from 'react-dom/server'
import Seminars from './Seminars.jsx'

test('세미나 빈 상태 문구 렌더', () => {
  const html = renderToString(<Seminars />)
  expect(html).toContain('아직 기록된 회차가 없다. 세미나 개시 후 회차별 정리가 쌓인다.')
})
