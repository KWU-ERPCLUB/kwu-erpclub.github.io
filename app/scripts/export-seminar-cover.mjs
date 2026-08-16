// 세미나 전용 표지 썸네일(public/img/세미나/cover-<덱>.png, 1600×900) 생성기.
// 2026-08-15 신설: 구 표지 3종은 png만 반입돼 재현 불가였다(다크 톤 판정 착오의 원인) → 생성 소스를 repo에 고정.
// 톤 = 오너 픽 C안(2026-08-15) — 순백 면 + 검정 타이포 + 버건디 틴트 원(화이트리스트 ⑬ 틴트, 버건디 면 아님).
// 사용: node scripts/export-seminar-cover.mjs [덱 ...] (인자 없으면 COVERS 전 건). 빌드 불필요.
import { writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const run = promisify(execFile)

const APP = resolve(import.meta.dirname, '..')
const OUT = join(APP, 'public', 'img', '세미나')

// 표지 데이터 = 덱별 1레코드. 제목 2줄·부제 = md title에서 파생하되 **대시로 절을 잇지 않는다**(2026-08-15 규칙):
// 동격 나열이면 가운뎃점, 아니면 앞절만 싣는다. pill = 상단 좌측 검정 pill 문구(정규 = SEMINAR 0N / 특강 = SPECIAL).
const COVERS = {
  s1: { pill: 'SEMINAR 01', kind: 'OT', l1: 'AIM 1기', l2: 'OT', sub: '세팅과 큰 그림 · 오리엔테이션', count: null },
  sp1: { pill: 'SPECIAL', kind: '인지', l1: '질문에서', l2: '위임으로', sub: 'AI 활용 구조 3단 · Prompt · Context · Harness', count: 45 },
  s2: { pill: 'SEMINAR 02', kind: '실습', l1: '따라 치기에서', l2: '첫 위임까지', sub: '기고 1건과 내 소재 확정', count: 26 },
  s3: { pill: 'SEMINAR 03', kind: '실습', l1: '제작', l2: '스프린트', sub: '위임 · 확인 · 재위임으로 내 소재 1회 돌리기', count: 23 },
}

const CHROME = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].find(existsSync)

if (!CHROME) { console.error('Chrome 실행 파일을 찾지 못함'); process.exit(1) }

const html = (c) => `<!doctype html><meta charset="utf-8" />
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css" />
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/fonts-archive/Paperlogy/Paperlogy.css" />
<style>
  :root{
    --accent:#7a2030; --tint:#f6edef; --dark:#161616; --bg:#ffffff;
    --text:#141414; --text-sub:#55606c; --line:#e7e7e5;
    --fd:'Paperlogy','Pretendard Variable',Pretendard,sans-serif;
    --fb:'Pretendard Variable',Pretendard,-apple-system,sans-serif;
  }
  *{box-sizing:border-box}
  html,body{margin:0}
  body{width:1600px;height:900px;background:var(--bg);font-family:var(--fb);color:var(--text);
       display:flex;flex-direction:column;justify-content:center;padding:0 100px;position:relative;overflow:hidden}
  .blob{position:absolute;right:-150px;bottom:-260px;width:760px;height:760px;border-radius:999px;background:var(--tint)}
  .dot{position:absolute;right:216px;bottom:150px;width:14px;height:14px;border-radius:999px;background:var(--accent)}
  .top{position:absolute;top:74px;left:100px;right:100px;display:flex;justify-content:space-between;align-items:center;z-index:2}
  .pill{background:var(--dark);color:#fff;font:700 20px var(--fb);letter-spacing:.1em;padding:11px 26px;border-radius:999px}
  .kind{font:700 22px var(--fb);color:var(--accent)}
  .accbar{width:96px;height:6px;background:var(--accent);margin-bottom:34px;z-index:2}
  h1{font:800 116px/1.06 var(--fd);letter-spacing:-.03em;margin:0;color:var(--text);word-break:keep-all;z-index:2}
  .sub{font:600 32px var(--fb);color:var(--text-sub);margin-top:30px;z-index:2}
  .foot{position:absolute;bottom:70px;left:100px;right:100px;display:flex;justify-content:space-between;
        align-items:flex-end;border-top:1px solid var(--line);padding-top:26px;z-index:2}
  .brand{font:800 30px var(--fd);color:var(--text)}
  .org{font:500 19px var(--fb);color:var(--text-sub);margin-top:7px}
  .count{font:700 21px var(--fb);color:var(--text-sub)}
</style>
<div class="blob"></div><div class="dot"></div>
<div class="top"><span class="pill">${c.pill}</span><span class="kind">${c.kind}</span></div>
<div class="accbar"></div>
<h1>${c.l1}<br />${c.l2}</h1>
<div class="sub">${c.sub}</div>
<div class="foot">
  <div><div class="brand">AIM</div><div class="org">광운대학교 경영학부 ERP연구회 · MIS·AI 스터디</div></div>
  <div class="count">${c.count ? `발표자료 ${c.count}장` : ''}</div>
</div>`

const decks = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(COVERS)
for (const d of decks) {
  if (!COVERS[d]) { console.error(`표지 데이터 없음: ${d}`); process.exit(1) }
}

mkdirSync(OUT, { recursive: true })
const work = join(tmpdir(), 'aim-seminar-cover')
mkdirSync(work, { recursive: true })

for (const deck of decks) {
  const src = join(work, `${deck}.html`)
  const out = join(OUT, `cover-${deck}.png`)
  writeFileSync(src, html(COVERS[deck]), 'utf8')
  await run(CHROME, [
    '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--hide-scrollbars',
    `--user-data-dir=${join(work, 'profile')}`,
    '--window-size=1600,900', '--virtual-time-budget=9000',
    `--screenshot=${out}`, `file:///${src.replace(/\\/g, '/')}`,
  ], { timeout: 120000 })
  console.log(`cover written: ${out}`)
}
