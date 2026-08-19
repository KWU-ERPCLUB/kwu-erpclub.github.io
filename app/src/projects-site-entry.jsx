import React from 'react'
import ReactDOM from 'react-dom/client'
import ProjectSite from './pages/ProjectSite.jsx'
import './styles/global.css'
import './styles/project-site.css' // 허브 사이트 인터랙티브 상세 전용
import './styles/project-site-roadmap.css' // 세로 지그재그 로드맵

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ProjectSite />
  </React.StrictMode>,
)
