import React from 'react'
import ReactDOM from 'react-dom/client'
import Recruit from './Recruit.jsx'
import './styles/global.css'
import './styles/recruit.css'
import './styles/recruit-motion.css' // 진입 리빌·스태거(2026-08-20 분할 — /recruit 전용)
import './styles/recruit-form.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Recruit />
  </React.StrictMode>,
)
