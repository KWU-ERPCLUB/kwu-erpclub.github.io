// 연락 채널 일원화 가드(2026-08-05) — 단톡방 언급 위치가 CONTACT 상수만 참조하는지 고정.
// 핵심 = URL 빈 값이면 링크가 아니라 안내 문구가 나온다(깨진 링크 0), URL이 채워지면 자동 링크 전환.
import { expect, test } from 'vitest'
import { renderToString } from 'react-dom/server'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import Recruit from './Recruit.jsx'
import RecruitForm from './RecruitForm.jsx'
import { CONTACT, KAKAO_PENDING, hasKakaoChat } from './data/recruit.js'
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

test('CONTACT = 연락 채널 단일원천(오픈채팅 URL은 오너 제공 대기 = 빈 값)', () => {
  expect(CONTACT.kakaoOpenChatUrl).toBe('')
  expect(hasKakaoChat()).toBe(false)
  expect(CONTACT.githubUrl).toMatch(/^https:\/\/github\.com\//)
  expect(REPO_URL).toBe(CONTACT.githubUrl) // shared.jsx도 파생 — 주소 중복 0
})

test('카카오 오픈채팅 URL 하드코딩 0건 — 전 위치가 CONTACT 경유', () => {
  const offenders = walk(SRC)
    .filter((f) => f !== fileURLToPath(import.meta.url))
    .filter((f) => f !== path.join(SRC, 'data', 'recruit.js')) // 상수 원천만 URL 보유 허용
    .filter((f) => /https?:\/\/open\.kakao\.com/i.test(readFileSync(f, 'utf8')))
  expect(offenders).toEqual([])
})

test('URL 미제공 = 링크 대신 안내 문구(모집 페이지·신청 폼·FAQ)', () => {
  const recruit = renderToString(<Recruit />)
  expect(recruit).toContain(KAKAO_PENDING)
  expect(recruit).not.toContain('href=""') // 빈 href 링크 금지

  const form = renderToString(<RecruitForm configured={false} today="2026-09-01" />)
  expect(form).toContain(KAKAO_PENDING)
  expect(form).not.toContain('href=""')

  const 모집시기 = FAQ.find((f) => f.q.includes('언제 모집'))
  expect(모집시기.a).toContain(KAKAO_PENDING)
})
