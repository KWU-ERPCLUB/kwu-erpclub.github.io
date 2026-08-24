import React from 'react'
import ReactDOM from 'react-dom/client'
import ProjectAdsp from './pages/ProjectAdsp.jsx'
import './styles/global.css'
import './styles/project-reveal.css' // 인터랙티브 상세 2종 공용 리빌(2026-08-20 통합)
import './styles/project-adsp.css' // 인터랙티브 상세 전용(파일럿 — spec 2026-08-12)
import './styles/project-adsp-viz.css' // 고도화 조각(도트 필드·토글·실패 카드 — 오너 픽 2026-08-13)
import './styles/project-adsp-road.css' // v2 로드맵 레일·플로우 체인(2026-08-24 개편)
import './styles/project-adsp-objects.css' // v7 시각 오브젝트 V1·V2·V3·V5 + 타입 스케일 토큰(spec 2026-08-24)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ProjectAdsp />
  </React.StrictMode>,
)
