import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './auth/AuthProvider.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* 【關卡 6】AuthProvider 包住整個 App，裡面所有元件都能用 useAuth() 取得登入狀態 */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)
