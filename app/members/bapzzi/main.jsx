import React from 'react'
import ReactDOM from 'react-dom/client'

function Page() {
  return (
    <div className="wrap">
      <h1>신해원</h1>
      <p>경영학부 · ERP연구회 운영. 이 페이지는 멤버 개인 페이지의 첫 씨앗이다 — 각자 폴더에서 자기 방식대로 만든다.</p>
      <h2>작업물</h2>
      <ul>
        <li><a href="/articles/?p=2026-07-22-bapzzi-ai-trend-research">2026 AI 트렌드 리서치 3축 (기고)</a></li>
      </ul>
      <p><a href="/members/">← 멤버 목록</a></p>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(<Page />)
