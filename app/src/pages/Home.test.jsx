import { expect, test } from 'vitest'
import { renderToString } from 'react-dom/server'
import Home from './Home.jsx'
import tracks from '../../data/tracks.json'

test('트랙 카드 수 = 레지스트리 미러 행 수 (C5)', () => {
  const html = renderToString(<Home />)
  for (const t of tracks) expect(html).toContain(t.name)
  expect((html.match(/hub-badge/g) || []).length).toBe(tracks.length)
})
