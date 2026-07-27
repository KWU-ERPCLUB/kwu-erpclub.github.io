import { marked } from 'marked'

// ::: 요약 / 수치 / 용어 / 출처 컨테이너 — 기고 마크다운 전용 블록(문법 안내 = repo CONTRIBUTING.md)
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const rows = (text) => text.split('\n').filter((l) => l.trim()).map((line) => line.split('|').map((s) => (s || '').trim()))

const container = {
  name: 'container',
  level: 'block',
  start(src) {
    const m = src.match(/(^|\n):::\s/)
    return m ? m.index + (m[1] ? 1 : 0) : undefined
  },
  tokenizer(src) {
    const m = /^:::\s*(요약|수치|용어|출처|로드맵|결정|비교|분기점)\s*\n([\s\S]*?)\n:::\s*(?:\n+|$)/.exec(src)
    if (!m) return
    const token = { type: 'container', raw: m[0], kind: m[1], text: m[2], tokens: [] }
    if (m[1] === '요약') this.lexer.blockTokens(m[2], token.tokens)
    return token
  },
  renderer(token) {
    if (token.kind === '요약') {
      return `<aside class="md-summary"><span class="md-block-label">핵심 요약</span>${this.parser.parse(token.tokens)}</aside>`
    }
    if (token.kind === '수치') {
      // 행 형식: 숫자 | 설명 | 출처(선택) — 수치 카드엔 출처 표기 권장(stat-src 문법)
      const items = rows(token.text).map(([num, desc, src]) =>
        `<div class="md-stat"><span class="md-stat-num">${esc(num)}</span><span class="md-stat-desc">${esc(desc || '')}</span>${src ? `<span class="md-stat-src">${esc(src)}</span>` : ''}</div>`).join('')
      return `<div class="md-stats">${items}</div>`
    }
    if (token.kind === '로드맵') {
      // 행 형식: 날짜 | 제목 | 한 줄(선택) — 여정 타임라인(데스크톱 가로 레일·모바일 세로).
      // 제목 앞 ⭐ = 대형 분기점 마커(li.md-rm-major, 별 문자는 제거하고 클래스로 표현).
      const items = rows(token.text).map(([date, title, sub]) => {
        const major = (title || '').startsWith('⭐')
        const label = major ? (title || '').slice(1).trim() : title || ''
        return `<li${major ? ' class="md-rm-major"' : ''}><span class="md-rm-date">${esc(date)}</span><span class="md-rm-mark" aria-hidden="true"></span><span class="md-rm-body"><strong>${esc(label)}</strong>${sub ? `<span class="md-rm-sub">${esc(sub)}</span>` : ''}</span></li>`
      }).join('')
      return `<ol class="md-roadmap">${items}</ol>`
    }
    if (token.kind === '결정') {
      // 행 형식: 문제 | 결정 | 근거(선택) | 폐기한 대안(선택) — 의사결정 로직 카드
      const items = rows(token.text).map(([q, a, why, dropped]) =>
        `<div class="md-decision"><p class="md-dc-flow"><span class="md-dc-q">${esc(q)}</span><span class="md-dc-arrow" aria-hidden="true">→</span><strong class="md-dc-a">${esc(a || '')}</strong></p>${why ? `<p class="md-dc-why">${esc(why)}</p>` : ''}${dropped ? `<p class="md-dc-dropped">폐기 — <s>${esc(dropped)}</s></p>` : ''}</div>`).join('')
      return `<div class="md-decisions">${items}</div>`
    }
    if (token.kind === '분기점') {
      // 행 형식: 5행 고정 라벨(문제·따진 대안·결정·버린 것·결과) | 내용 — 대형 분기점 보록(wide).
      // 라벨 순서 고정, 누락 행은 미표시. 라벨 밖 행은 무시(오타 안전).
      const ORDER = ['문제', '따진 대안', '결정', '버린 것', '결과']
      const map = new Map(rows(token.text).map(([label, body]) => [(label || '').trim(), body || '']))
      const items = ORDER.filter((l) => map.get(l)).map((l) =>
        `<div class="md-br-row${l === '결정' ? ' md-br-key' : ''}"><span class="md-br-label">${esc(l)}</span><span class="md-br-body">${esc(map.get(l))}</span></div>`).join('')
      return `<aside class="md-branch"><span class="md-block-label">분기점</span>${items}</aside>`
    }
    if (token.kind === '비교') {
      // 행 형식: 이미지경로 | 캡션 — 2열 나란히(변경 전→후). 경로는 사이트 내부(/) 한정
      const items = rows(token.text).map(([src, cap]) => {
        const safe = (src || '').startsWith('/') ? src : ''
        return safe ? `<figure class="md-cmp-item"><img src="${esc(safe)}" alt="${esc(cap || '')}" loading="lazy"><figcaption>${esc(cap || '')}</figcaption></figure>` : ''
      }).join('')
      return `<div class="md-compare">${items}</div>`
    }
    if (token.kind === '용어') {
      // 행 형식: 용어 | 설명 — 본문 ¹⁾²⁾ 각주 마커와 순번 대응(글 하단 작은 글씨)
      const items = rows(token.text).map(([term, def]) =>
        `<li><strong>${esc(term)}</strong> — ${esc(def || '')}</li>`).join('')
      return `<aside class="md-terms"><span class="md-block-label">용어 설명</span><ol>${items}</ol></aside>`
    }
    // 출처 — 행 형식: 이름 | URL | 비고(선택). 글 하단 리서치 출처 모음.
    const items = rows(token.text).map(([name, url, note]) => {
      const safe = /^https?:\/\//.test(url || '') ? url : ''
      const label = safe ? `<a href="${esc(safe)}" target="_blank" rel="noreferrer">${esc(name)}</a>` : esc(name)
      return `<li>${label}${note ? ` <span class="md-source-note">— ${esc(note)}</span>` : ''}</li>`
    }).join('')
    return `<aside class="md-sources"><span class="md-block-label">리서치 출처</span><ol>${items}</ol></aside>`
  },
}

marked.use({ renderer: { html: () => '' }, extensions: [container] })

export default function Markdown({ body }) {
  return <div className="hub-md" dangerouslySetInnerHTML={{ __html: marked.parse(body) }} />
}
