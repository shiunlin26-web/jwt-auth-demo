import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'
import './index.css'
import { router } from './app/router.tsx'
import { AuthProvider } from './auth/AuthProvider.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* 【關卡 6】AuthProvider 包住整個 App，裡面所有元件都能用 useAuth() 取得登入狀態 */}
    <AuthProvider>
      {/* 【關卡 7】RouterProvider：依網址顯示 router.tsx 裡對應的頁面（取代原本的 App.tsx） */}
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
)
