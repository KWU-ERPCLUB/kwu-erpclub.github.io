import React from 'react'
import ReactDOM from 'react-dom/client'
import Projects from './Projects.jsx'
import './styles/global.css'
import './styles/pages.css' // hub-page·hub-head·hub-idx·hub-empty·hub-back·hub-md 공용(내부형 셸)
import './styles/projects.css' // DPM 그리드·호버 오버레이·상세 배너·프롬프트 로그(신규)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Projects />
  </React.StrictMode>,
)
