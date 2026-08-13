import React from 'react'
import ReactDOM from 'react-dom/client'
import ProjectAdsp from './pages/ProjectAdsp.jsx'
import './styles/global.css'
import './styles/project-adsp.css' // 인터랙티브 상세 전용(파일럿 — spec 2026-08-12)
import './styles/project-adsp-viz.css' // 고도화 조각(도트 필드·토글·실패 카드 — 오너 픽 2026-08-13)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ProjectAdsp />
  </React.StrictMode>,
)
