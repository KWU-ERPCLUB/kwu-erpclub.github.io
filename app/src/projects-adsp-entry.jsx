import React from 'react'
import ReactDOM from 'react-dom/client'
import ProjectAdsp from './pages/ProjectAdsp.jsx'
import './styles/global.css'
import './styles/project-adsp.css' // 인터랙티브 상세 전용(파일럿 — spec 2026-08-12)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ProjectAdsp />
  </React.StrictMode>,
)
