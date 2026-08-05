import React from 'react'
import ReactDOM from 'react-dom/client'
import Articles from './pages/Articles.jsx'
import './styles/global.css'
import './styles/articles.css'
import './styles/hub-md.css' // .hub-md 공용(브레이크아웃 그리드+블록 서식, 2026-07-28)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode><Articles /></React.StrictMode>,
)
