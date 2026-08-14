import React from 'react'
import ReactDOM from 'react-dom/client'
import Workspace from './workspace/Workspace.jsx'
import './styles/global.css'
import './styles/workspace.css'
import './styles/workspace-home.css'
import './styles/workspace-postings.css'
import './styles/workspace-mypage.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Workspace />
  </React.StrictMode>,
)
