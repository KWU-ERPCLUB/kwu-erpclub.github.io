// Copied from AIM deck v2 runtime (erp-club/docs/deck04-빌드/engine.js) + ?font=pretendard toggle.
// AIM deck v2 runtime: one slide at a time, scaled to window. Keys: arrows / space / PageUp-Down / Home / End, R = replay.
// Steps (D-117): [data-step=n] elements show from step n; forward reveals the next step before the next slide. Classes: on (shown),
// now (current step), past (earlier step). Slide gets data-s. Hash #6.3 = slide index 6 (= 장 6, slide 0 is the demo video) at step 3.
// static / all / print show the last step. Video slide (D-154): arrows = prev / next slide any time, Space · Enter · click = play / pause, Shift+←/→ = ±10s.
(() => {
  const H = document.documentElement, q = new URLSearchParams(location.search)
  if (q.get('static')) H.classList.add('static')
  if (q.get('all')) H.classList.add('all')
  if (q.get('font') === 'pretendard') H.classList.add('pt')
  const stage = document.getElementById('stage'), slides = [...document.querySelectorAll('.slide')]
  // stagger indexes for children of .seq / .idx groups
  document.querySelectorAll('.seq,.idx').forEach(g => [...g.children].forEach((c, i) => c.style.setProperty('--i', i)))
  function count(sl) {
    sl.querySelectorAll('[data-count]').forEach(e => {
      const t = +e.dataset.count, d = +(e.dataset.delay || 0), fmt = n => e.dataset.comma ? n.toLocaleString('ko-KR') : String(n)
      if (H.classList.contains('static')) { e.textContent = fmt(t); return }
      e.textContent = fmt(0)
      setTimeout(() => { const s = performance.now(); const f = n => { const p = Math.min(1, (n - s) / 800); e.textContent = fmt(Math.round(t * (1 - Math.pow(1 - p, 3)))); if (p < 1) requestAnimationFrame(f) }; requestAnimationFrame(f) }, d)
    })
  }
  const last = sl => Math.max(0, ...[...sl.querySelectorAll('[data-step]')].map(e => +e.dataset.step))
  function step(sl, s) {
    sl.dataset.s = s
    sl.querySelectorAll('[data-step]').forEach(e => { const k = +e.dataset.step
      e.classList.toggle('on', k <= s); e.classList.toggle('now', k === s); e.classList.toggle('past', k < s) })
  }
  function play(sl) { sl.classList.remove('in'); void sl.offsetWidth; sl.classList.add('in'); count(sl) }
  if (H.classList.contains('all')) { slides.forEach(sl => { step(sl, last(sl)); play(sl) }); return }
  const full = H.classList.contains('static')
  let cur = 0, s = 0
  function fit() { const s = Math.min(innerWidth / 1920, innerHeight / 1080); stage.style.transform = `translate(-50%,-50%) scale(${s})` }
  function go(n, at) {
    cur = Math.max(0, Math.min(slides.length - 1, n))
    slides.forEach((x, i) => { x.classList.toggle('active', i === cur); if (i !== cur) { x.classList.remove('in', 'vin', 'vout'); x.querySelectorAll('video').forEach(v => v.pause()) } })
    const sl = slides[cur]; s = full ? last(sl) : Math.min(at ?? 0, last(sl)); step(sl, s)
    play(sl); vstart(sl); mark()
  }
  function mark() { history.replaceState(null, '', '#' + cur + (s ? '.' + s : '')) }
  const vid = () => slides[cur].querySelector('video')
  function next() { if (s < last(slides[cur])) { step(slides[cur], ++s); mark() } else go(cur + 1) }
  function prev() { if (s > 0) { step(slides[cur], --s); mark() } else if (cur > 0) go(cur - 1, 99) }
  // video slide: arrows / PageUp-Down still move between slides at any time; Space · Enter · click = play / pause;
  // Shift + ← / → = 10s back / forward inside the video
  const toggle = v => { if (v.paused || v.ended) v.play(); else v.pause() }
  // video slides (11-05): entering plays from the start with a fade-in of picture and sound; the last FADE seconds fade out
  // and the deck moves on by itself, so a clip reads as part of the talk, not a cut. ?noauto = stay on the last frame.
  const FADE = 0.6, auto = !q.get('noauto')
  function vstart(sl) {
    const v = sl.querySelector('video'); if (!v || full) return
    sl.classList.remove('vin', 'vout'); v.currentTime = 0; v.volume = 0
    v.play().then(() => sl.classList.add('vin')).catch(() => {})
  }
  function vtick() {
    const sl = slides[cur], v = sl && sl.querySelector('video')
    if (v && !v.paused && v.duration) {
      const t = v.currentTime, left = v.duration - t
      v.volume = Math.max(0, Math.min(1, t / FADE, left / FADE))
      if (left < FADE) sl.classList.add('vout')
    }
  }
  setInterval(vtick, 40)  // not rAF: rAF stops in a hidden tab
  slides.forEach(sl => { const v = sl.querySelector('video'); if (v) v.addEventListener('timeupdate', vtick); if (v) v.addEventListener('ended', () => { if (auto && slides[cur] === sl) go(cur + 1) }) })
  addEventListener('resize', fit); fit()
  addEventListener('keydown', e => {
    const v = vid()
    if (v && e.shiftKey && ['ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault(); v.currentTime = Math.max(0, Math.min(v.duration || 0, v.currentTime + (e.key === 'ArrowRight' ? 10 : -10))); return }
    if (v && [' ', 'Enter'].includes(e.key)) { e.preventDefault(); toggle(v); return }
    if (['ArrowRight', 'ArrowDown', 'PageDown', ' ', 'Enter'].includes(e.key)) { e.preventDefault(); next() }
    else if (['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace'].includes(e.key)) { e.preventDefault(); prev() }
    else if (e.key === 'Home') go(0)
    else if (e.key === 'End') go(slides.length - 1)
    else if (e.key === 'r' || e.key === 'R') { const v = vid(); if (v) { v.pause(); v.currentTime = 0 } go(cur) }
  })
  addEventListener('click', e => { if (e.target.closest('a')) return; const v = vid(); if (v) return toggle(v); if (e.clientX < innerWidth * 0.25) prev(); else next() })
  const [hs, hstep] = location.hash.slice(1).split('.')
  const n0 = parseInt(hs)
  go(isNaN(n0) ? 0 : n0, parseInt(hstep) || 0)
  // review aid: ?t=1400 freezes every animation at 1.4s (mid-animation capture with headless Chrome)
  if (q.get('t')) setTimeout(() => document.getAnimations().forEach(x => { x.pause(); x.currentTime = +q.get('t') }), 200)
})()
