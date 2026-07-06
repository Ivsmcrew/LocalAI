import React from 'react'
import ReactDOM from 'react-dom/client'
import { APP_NAME } from '@shared/env'
import App from './App'
import './index.css'

document.title = APP_NAME

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
