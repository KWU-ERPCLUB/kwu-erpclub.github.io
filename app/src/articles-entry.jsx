import React from 'react'
import ReactDOM from 'react-dom/client'
import Articles from './pages/Articles.jsx'
import './styles/global.css'
import './styles/articles.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode><Articles /></React.StrictMode>,
)
