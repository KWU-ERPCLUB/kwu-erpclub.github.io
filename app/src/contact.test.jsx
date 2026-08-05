// 연락 채널 일원화 가드(2026-08-05 · 같은 날 이메일 확정) — 문의 언급 위치가 CONTACT 상수만 참조하는지 고정.
// 핵심 = 이메일 하드코딩 0건(원천 1곳), 렌더 위치(모집 문의·폼 폴백·FAQ)에 mailto 링크가 실제로 나온다.
import { expect, test } from 'vitest'
import { renderToString } from 'react-dom/server'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import Recruit from './Recruit.jsx'
import RecruitForm from './RecruitForm.jsx'
import { CONTACT, CONTACT_MAILTO } from './data/recruit.js'
import { FAQ } from './data/faq.js'
import { REPO_URL } from './shared.jsx'

const SRC = path.dirname(fileURLToPath(import.meta.url))

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name)
    if (statSync(full).isDirectory()) walk(full, out)
    else if (/\.(js|jsx)$/.test(full)) out.push(full)
  }
  return out
}

test('CONTACT = 연락 채널 단일원천(이메일 + GitHub)', () => {
  expect(CONTACT.email).toBe('win7374@kw.ac.kr')
  expect(CONTACT_MAILTO).toBe(`mailto:${CONTACT.email}`)
  expect(CONTACT.githubUrl).toMatch(/^https:\/\/github\.com\//)
  expect(REPO_URL).toBe(CONTACT.githubUrl) // shared.jsx도 파생 — 주소 중복 0
})

test('이메일 주소 하드코딩 0건 — 전 위치가 CONTACT 경유', () => {
  const offenders = walk(SRC)
    .filter((f) => f !== fileURLToPath(import.meta.url))
    .filter((f) => f !== path.join(SRC, 'data', 'recruit.js')) // 상수 원천만 주소 보유 허용
    .filter((f) => readFileSync(f, 'utf8').includes(CONTACT.email))
  expect(offenders).toEqual([])
})

test('문의 렌더 = mailto 링크(모집 페이지·신청 폼 폴백·FAQ)', () => {
  const recruit = renderToString(<Recruit />)
  expect(recruit).toContain(`href="${CONTACT_MAILTO}"`)
  expect(recruit).not.toContain('href=""') // 빈 href 링크 금지
  expect(recruit).not.toContain('단톡방') // 구 채널 잔재 0

  const form = renderToString(<RecruitForm configured={false} today="2026-09-01" />)
  expect(form).toContain(`href="${CONTACT_MAILTO}"`)

  const 모집시기 = FAQ.find((f) => f.q.includes('언제 모집'))
  expect(모집시기.a).toContain(CONTACT.email)
})
