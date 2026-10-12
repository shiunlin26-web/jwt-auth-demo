from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from routes import auth, users

# 【關卡 5】原本這裡有 lifespan，啟動時用 SQLModel.metadata.create_all 自動建表。
# create_all 只會建「不存在的表」，改欄位時不會更新已存在的表（關卡 1 就踩過）。
# 現在資料表結構改由 Alembic 管理：改完 models.py 後執行
#   alembic revision --autogenerate --rev-id 000X -m "說明"   ← 產生遷移檔
#   alembic upgrade head                                     ← 套用到資料庫
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,  # 【關卡 2】改從設定讀
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 【關卡 10】所有 API 統一掛在 /api 底下：/api/auth/login、/api/me、/api/ping
#
# 為什麼？正式環境前端在 Vercel、後端在 Render，是兩個不同的網域。
# 如果前端直接打後端網址，就是「跨站」請求，refresh token 的 cookie（SameSite=Lax）不會被帶上，
# 重新整理就會掉登入；改成 SameSite=None 又會被 iPhone Safari 擋掉。
#
# 解法是讓瀏覽器以為前後端是同一個網站：前端只打「自己網域的 /api/...」，
# 由 Vercel 把 /api/* 轉發（rewrite）到 Render。這就是「反向代理」。
# 本機開發也一樣：Vite 的 server.proxy 把 /api/* 轉到 localhost:8000（frontend/vite.config.ts）。
# 後端把所有路徑都加上 /api 前綴，代理時就不用改寫路徑，本機和正式環境長得一模一樣。
api = APIRouter(prefix="/api")
api.include_router(auth.router)
api.include_router(users.router)


@api.get("/ping")
async def ping():
    return {"message": "pong"}


app.include_router(api)
