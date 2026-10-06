import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'
import './index.css'
import { router } from './app/router.tsx'
import { initializeAuth } from './auth/authService.ts'

// 【關卡 8】App 啟動時檢查一次登入狀態（用 refresh token 換 access token）
// 不用 await：先把畫面畫出來（顯示「載入中」），檢查完 store 更新，畫面自動跟著變
initializeAuth()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* 【關卡 7】RouterProvider：依網址顯示 router.tsx 裡對應的頁面 */}
    {/* 【關卡 8】不再需要 <AuthProvider>：登入狀態改放在 Zustand store，不需要 Provider */}
    <RouterProvider router={router} />
  </StrictMode>,
)
