import React from 'react'
import ReactDOM from 'react-dom/client'
import Projects from './Projects.jsx'
import './styles/global.css'
import './styles/home.css' // dir-row·next-list·data-note 공용(.page 규칙은 미사용이라 무해)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Projects />
  </React.StrictMode>,
)
