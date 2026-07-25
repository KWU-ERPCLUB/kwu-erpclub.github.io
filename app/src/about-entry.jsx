import React from 'react'
import ReactDOM from 'react-dom/client'
import About from './About.jsx'
import './styles/global.css'
import './styles/home.css'
import './styles/home-sections.css'
import './styles/about.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <About />
  </React.StrictMode>,
)
