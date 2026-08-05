// 인사이트 카드 썸네일 해석 — 4계층 폴백(오너 픽 2026-08-05 D). 순수 함수(부수효과 0) = 테스트 대상.
//   ① frontmatter `이미지`(기존 로고 방식 존치)
//   ② 본문 md 첫 이미지 — `/img/기사/` 경로만 허용(외부 URL·타 경로 무시)
//   ③ 브랜드 로고(`/img/logos/`) → 없으면 주제 스톡(`/img/thumbs/`)
//   ④ 자동 타이포 커버(인라인 SVG — 외부 의존 0)
// 반환 = { kind, src, fit, alt } · kind='cover'면 src 없음(InsightCover가 그림).
// fit: 'contain' = 로고(여백 필요) · 'cover' = 사진(꽉 채움). 전 계층 동일 비율 프레임(CSS .art-cover)이 이질감을 흡수한다.

const ARTICLE_IMG_PREFIX = '/img/기사/'
const LOGO_DIR = '/img/logos/'
const STOCK_DIR = '/img/thumbs/'

// ── ③-a 브랜드 감지 (제목·태그·설명에서 키워드 → public/img/logos/ 실재 파일만) ──
// 순서 = 구체적인 것 먼저(먼저 걸린 하나만 채택).
export const BRAND_RULES = [
  [/claude|클로드/i, 'claude.svg'],
  [/anthropic|앤스로픽/i, 'anthropic.svg'],
  [/codex/i, 'codex.png'],
  [/copilot|코파일럿|microsoft|마이크로소프트|\bms\b/i, 'copilot.svg'],
  [/gemini|제미나이|google|구글/i, 'gemini.svg'],
  [/openai|오픈ai|gpt|챗지피티|chatgpt/i, 'openai.svg'],
  [/perplexity|퍼플렉시티/i, 'perplexity.svg'],
  [/hugging\s*face|허깅페이스/i, 'huggingface.svg'],
  [/langchain|랭체인/i, 'langchain.svg'],
  [/mistral|미스트랄/i, 'mistral.svg'],
  [/ollama/i, 'ollama.svg'],
  [/\bmeta\b|메타|llama|라마/i, 'meta.svg'],
  [/github|깃허브/i, 'github.svg'],
  [/notion|노션/i, 'notion.svg'],
  [/zapier|재피어/i, 'zapier.svg'],
  [/\bn8n\b/i, 'n8n.svg'],
  [/kaggle|캐글/i, 'kaggle.svg'],
  [/colab|코랩/i, 'colab.svg'],
]

// ── ③-b 소재 스톡 (public/img/thumbs/ — Unsplash License, 출처 = 같은 폴더 SOURCES.md) ──
// 브랜드가 없을 때 제목·태그의 소재 키워드로 고른다. 걸리지 않으면 주제 enum 기본값.
export const SUBJECT_RULES = [
  [/반도체|웨이퍼|\bchip\b|hbm|엔비디아|nvidia|하이닉스|파운드리|\bgpu\b/i, 'semiconductor.jpg'],
  [/데이터센터|data\s*center|서버\s*랙|인프라|gpuaas|클라우드|전력/i, 'datacenter.jpg'],
  [/채용|일자리|고용|취업|진로|자격증|직무|커리어|시트|seats|인력/i, 'office.jpg'],
  [/로봇|휴머노이드|robot|에이전트|agent/i, 'robot.jpg'],
  [/영상|비디오|video|영화|film|이미지\s*생성|미디어|사운드|음성|더빙|광고/i, 'media.jpg'],
  [/실적|매출|투자|조달|주가|시가총액|가격|price|요금|밸류|펀딩|인수/i, 'market.jpg'],
  [/보안|규제|거버넌스|리스크|ai\s*act|저작권|프라이버시|유출|탈옥|샌드박스|감사|컴플라이언스/i, 'security.jpg'],
  [/대학|캠퍼스|교육|강의|학습|스터디|커리큘럼|학생/i, 'campus.jpg'],
  [/코드|코딩|개발|api\b|sdk\b|자동화|워크플로|파이프라인|배포|테스트/i, 'code.jpg'],
  [/모델|오픈\s*웨이트|open[-\s]?weight|파라미터|벤치마크|\bllm\b|추론|컨텍스트/i, 'network.jpg'],
  [/회의|협업|조직|팀|업무|사내|도입|온보딩/i, 'meeting.jpg'],
]

// 주제(schema.js TOPICS) → 기본 스톡. 소재 키워드가 하나도 안 걸릴 때만 쓴다.
export const TOPIC_STOCK = {
  '에이전트': 'robot.jpg',
  '모델·플랫폼': 'network.jpg',
  '워크플로·자동화': 'code.jpg',
  '거버넌스·리스크': 'security.jpg',
  '시장·생태계': 'market.jpg',
  '크리에이티브·미디어': 'media.jpg',
}
// 소재 키워드는 걸렸지만 주제가 enum 밖일 때의 최후 스톡. 주제·소재 모두 미상이면 ④ 커버로 내려간다.
export const DEFAULT_STOCK = 'ai-abstract.jpg'

// 검색 대상 텍스트 = 제목 + 태그 + 주제(설명·본문은 잡음이 커서 제외).
function haystack(a) {
  const tags = Array.isArray(a['태그']) ? a['태그'].join(' ') : ''
  return `${a.title || ''} ${tags} ${a['주제'] || ''}`
}

// 본문 md에서 첫 이미지 경로 — `/img/기사/` 로 시작하는 것만(자체 도판). 외부 URL·타 경로 = 무시.
export function firstBodyImage(body) {
  const re = /!\[[^\]]*\]\(\s*([^)\s]+)/g
  let m
  while ((m = re.exec(body || '')) !== null) {
    if (m[1].startsWith(ARTICLE_IMG_PREFIX)) return m[1]
  }
  return null
}

// 브랜드 로고 파일명(없으면 null).
export function brandLogo(a) {
  const hay = haystack(a)
  for (const [re, file] of BRAND_RULES) if (re.test(hay)) return file
  return null
}

// 소재·주제 스톡 파일명 — 소재 키워드 → 주제 enum 순. 둘 다 미상이면 null(→ ④ 커버).
export function stockFile(a) {
  const hay = haystack(a)
  for (const [re, file] of SUBJECT_RULES) if (re.test(hay)) return file
  if (a['주제']) return TOPIC_STOCK[a['주제']] || DEFAULT_STOCK
  return null
}

// 4계층 폴백 해석. 반환 kind = 'field' | 'body' | 'logo' | 'stock' | 'cover'.
export function resolveThumb(a) {
  if (!a) return { kind: 'cover', src: null, fit: 'cover', alt: '' }
  const field = typeof a['이미지'] === 'string' ? a['이미지'].trim() : ''
  if (field) {
    const logo = field.startsWith(LOGO_DIR)
    return { kind: 'field', src: field, fit: logo ? 'contain' : 'cover', alt: '' }
  }
  const inBody = firstBodyImage(a.body)
  if (inBody) return { kind: 'body', src: inBody, fit: 'contain', alt: '' }
  const logo = brandLogo(a)
  if (logo) return { kind: 'logo', src: `${LOGO_DIR}${logo}`, fit: 'contain', alt: '' }
  const stock = stockFile(a)
  if (stock) return { kind: 'stock', src: `${STOCK_DIR}${stock}`, fit: 'cover', alt: '' }
  return { kind: 'cover', src: null, fit: 'cover', alt: '' }
}
