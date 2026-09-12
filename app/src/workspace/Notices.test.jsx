import { expect, test } from 'vitest'
import { renderToString } from 'react-dom/server'
import Notices, { firstParagraph } from './Notices.jsx'
import { createMockRepositories } from '../data/mock.js'

const flat = (node) => renderToString(node).replace(/<!-- -->/g, '')

test('firstParagraph — 제목·목록·구분선 건너뛰고 첫 문단, 마크다운 기호 제거, 길이 상한', () => {
  expect(firstParagraph('# 제목\n\n- 목록\n\n**굵은** 첫 문단입니다. [링크](https://x)도.\n\n둘째')).toBe('굵은 첫 문단입니다. 링크도.')
  expect(firstParagraph('::: 요약\n요약 줄\n:::\n본문 시작')).toBe('요약 줄')
  expect(firstParagraph('가'.repeat(200), 20).length).toBe(20)
  expect(firstParagraph('')).toBe('')
})

test('공지 탭 = 2열 골격(본문 + 레일) · 준비물 카드에 종류 라벨·요약 · 읽는 법 레일 · 5건 미만이면 필터 칩 없음', () => {
  const html = flat(<Notices store={createMockRepositories()} />)
  expect(html).toContain('ws-cols')
  expect(html).toContain('ws-crail')
  expect(html).toContain('class="ws-nkind">준비물')
  expect(html).toContain('ws-ncard-sum')
  expect(html).toContain('읽는 법')
  expect(html).not.toContain('ws-nchips')
})
