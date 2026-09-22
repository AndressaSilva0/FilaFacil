import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/global.css'
import { QueueProvider } from './context/QueueContext'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueueProvider>
      <App />
    </QueueProvider>
  </StrictMode>,
)

