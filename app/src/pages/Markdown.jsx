import { marked } from 'marked'

// ::: 요약 / 수치 / 용어 / 출처 / 로드맵 / 결정 컨테이너 — 기고 마크다운 전용 블록(문법 안내 = repo CONTRIBUTING.md)
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
    const m = /^:::\s*(요약|수치|용어|출처|로드맵|결정|탑|브리핑|질문|정보|링크)\s*\n([\s\S]*?)\n:::\s*(?:\n+|$)/.exec(src)
    if (!m) return
    const token = { type: 'container', raw: m[0], kind: m[1], text: m[2], tokens: [] }
    if (m[1] === '요약') this.lexer.blockTokens(m[2], token.tokens)
    return token
  },
  renderer(token) {
    if (token.kind === '요약') {
      return `<aside class="md-summary"><span class="md-block-label">핵심 요약</span>${this.parser.parse(token.tokens)}</aside>`
    }
    if (token.kind === '질문') {
      // 심층 머리 「이 글이 답하는 질문」 — 행 = 질문 1개(3개 고정, schema가 검사). 주간이 답 못 한 질문만.
      const items = rows(token.text).map(([q]) => `<li>${esc(q)}</li>`).join('')
      return `<aside class="md-questions"><span class="md-block-label">이 글이 답하는 질문</span><ol>${items}</ol></aside>`
    }
    if (token.kind === '탑' || token.kind === '브리핑') {
      // 주간 트렌드 카드(2026-09-12 오너: "브리핑이 너무 짧고 줄맞춤이 안 된다") — 행 형식:
      //   탑:   번호 | 축 | 제목 | 본문(2~3문장) | URL | 출처명
      //   브리핑: 키워드 | 축 | 본문(2~3문장) | URL | 출처명(선택)
      // 축 라벨 색 = articles.css .axis-* (카드·필터와 같은 3색). 본문 안 **볼드**는 살린다.
      const inline = (s) => marked.parseInline(esc(s))
      const AXIS_KEY = { 'AI활용': 'use', 'AI×취업': 'jobs', 'AI×MIS': 'mis' }
      const isTop = token.kind === '탑'
      const items = rows(token.text).map((cells) => {
        const [a, b, c, d, e, f] = cells
        const num = isTop ? a : null
        const axis = isTop ? b : b
        const title = isTop ? c : a
        const body = isTop ? d : c
        const url = isTop ? e : d
        const src = isTop ? f : e
        const safe = /^https?:\/\//.test(url || '') ? url : ''
        const link = safe ? `<a class="md-card-link" href="${esc(safe)}" target="_blank" rel="noreferrer">${esc(src || '원문')} ↗</a>` : ''
        return `<li class="md-card${isTop ? ' md-card--top' : ''}">${num ? `<span class="md-card-num">${esc(num)}</span>` : ''}<span class="md-card-head"><span class="art-label art-label-axis axis-${AXIS_KEY[axis] || 'use'}">${esc(axis || '')}</span><strong class="md-card-title">${inline(title || '')}</strong></span><p class="md-card-body">${inline(body || '')}</p>${link}</li>`
      }).join('')
      return `<ol class="md-cards${isTop ? ' md-cards--top' : ''}">${items}</ol>`
    }
    if (token.kind === '정보') {
      // 공지 정보 표(2026-09-13 공지 서식 통일) — 행 = 키 | 값(최대 5행). 날짜·장소·대상·마감처럼 훑어 읽는 사실만.
      const items = rows(token.text).slice(0, 5).map(([k, v]) => `<div class="md-info-row"><dt>${esc(k)}</dt><dd>${marked.parseInline(esc(v || ''))}</dd></div>`).join('')
      return `<dl class="md-info">${items}</dl>`
    }
    if (token.kind === '링크') {
      // 공지 링크 카드(2026-09-13) — 행 = 라벨 | 주소(내부 / 또는 http). 과제·가이드·외부 사이트를 카드 한 장씩(최대 5).
      const items = rows(token.text).slice(0, 5).map(([label, url]) => {
        const safe = /^(https?:\/\/|\/)/.test(url || '') ? url : ''
        const ext = /^https?:\/\//.test(safe)
        const dom = ext ? safe.replace(/^https?:\/\//, '').replace(/\/$/, '') : ''
        const inner = `<span class="md-linkcard-label">${esc(label)}</span>${dom ? `<span class="md-linkcard-dom">${esc(dom)}</span>` : ''}<span class="md-linkcard-go">${ext ? '열기 ↗' : '이동 →'}</span>`
        return safe ? `<li><a class="md-linkcard" href="${esc(safe)}"${ext ? ' target="_blank" rel="noreferrer"' : ''}>${inner}</a></li>` : `<li><span class="md-linkcard">${inner}</span></li>`
      }).join('')
      return `<ul class="md-links">${items}</ul>`
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
        `<div class="md-decision"><p class="md-dc-flow"><span class="md-dc-q">${esc(q)}</span><span class="md-dc-arrow" aria-hidden="true">→</span><strong class="md-dc-a">${esc(a || '')}</strong></p>${why ? `<p class="md-dc-why">${esc(why)}</p>` : ''}${dropped ? `<p class="md-dc-dropped">폐기: <s>${esc(dropped)}</s></p>` : ''}</div>`).join('')
      return `<div class="md-decisions">${items}</div>`
    }
    // (구 `비교`·`분기점` 블록 = 2026-08-20 삭제 — 프로젝트 md 상세 폐지로 사용처 0.
    //  기사가 쓰는 블록은 요약·수치·용어·출처·로드맵·결정 6종.)
    if (token.kind === '용어') {
      // 행 형식: 용어 | 설명 — 본문 ¹⁾²⁾ 각주 마커와 순번 대응(글 하단 작은 글씨)
      const items = rows(token.text).map(([term, def]) =>
        `<li><strong>${esc(term)}</strong>: ${esc(def || '')}</li>`).join('')
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
