// 가이드 페이지 — 회차 준비물 하는 법(2026-09-13). 공개 URL(/guide/<id>/), 로그인 불필요(내용은 공지와 같은 공개 수준).
// 골격 = 공개면 셸(SiteNav · PageHead · SiteFooter) + 준비물 본체(PrepGuideBody). 공지 탭·로드맵·과제에서 링크 카드로 들어온다.
import { SiteNav, SiteFooter, PageHead } from '../shared.jsx'
import { PrepGuideBody } from '../workspace/PrepNotice.jsx'
import { PREP_GUIDES } from '../data/prep-guides.js'

export const guideFromPath = (pathname, guides = PREP_GUIDES) => {
  const m = /\/guide\/([^/]+)\/?/.exec(pathname || '')
  return (m && guides.find((g) => g.id === m[1])) || guides[0] || null
}

export default function GuidePrep({ pathname }) {
  const guide = guideFromPath(pathname ?? (typeof window !== 'undefined' ? window.location.pathname : ''))
  return (
    <>
      <SiteNav />
      <main id="main" className="page gp-wrap">
        {guide ? (
          <>
            <PageHead label="GUIDE" title={<>{guide.title} <em>하는 법</em></>} sub={`${guide.회차}회차 준비물. 항목을 누르면 단계가 열리고, 완료 체크는 이 기기에 남는다.`} />
            <section className="gp-body"><PrepGuideBody guide={guide} /></section>
          </>
        ) : <PageHead label="GUIDE" title="가이드 없음" />}
      </main>
      <SiteFooter />
    </>
  )
}
