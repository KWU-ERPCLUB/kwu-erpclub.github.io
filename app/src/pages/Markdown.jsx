import { marked } from 'marked'

// ::: 요약 / ::: 수치 컨테이너 — 기고 마크다운 전용 블록(문법 안내 = repo CONTRIBUTING.md)
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const container = {
  name: 'container',
  level: 'block',
  start(src) {
    const m = src.match(/(^|\n):::\s/)
    return m ? m.index + (m[1] ? 1 : 0) : undefined
  },
  tokenizer(src) {
    const m = /^:::\s*(요약|수치)\s*\n([\s\S]*?)\n:::\s*(?:\n+|$)/.exec(src)
    if (!m) return
    const token = { type: 'container', raw: m[0], kind: m[1], text: m[2], tokens: [] }
    if (m[1] === '요약') this.lexer.blockTokens(m[2], token.tokens)
    return token
  },
  renderer(token) {
    if (token.kind === '요약') {
      return `<aside class="md-summary"><span class="md-summary-label">핵심 요약</span>${this.parser.parse(token.tokens)}</aside>`
    }
    // 수치 — 행 형식: 숫자 | 설명 | 출처(선택). 수치 카드엔 출처 표기 권장(stat-src 문법)
    const items = token.text.split('\n').filter((l) => l.trim()).map((line) => {
      const [num, desc, src] = line.split('|').map((s) => (s || '').trim())
      return `<div class="md-stat"><span class="md-stat-num">${esc(num)}</span><span class="md-stat-desc">${esc(desc || '')}</span>${src ? `<span class="md-stat-src">${esc(src)}</span>` : ''}</div>`
    }).join('')
    return `<div class="md-stats">${items}</div>`
  },
}

marked.use({ renderer: { html: () => '' }, extensions: [container] })

export default function Markdown({ body }) {
  return <div className="hub-md" dangerouslySetInnerHTML={{ __html: marked.parse(body) }} />
}
