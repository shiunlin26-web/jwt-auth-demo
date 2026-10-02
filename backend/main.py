from fastapi import FastAPI
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

app.include_router(auth.router)
app.include_router(users.router)

@app.get("/ping")
async def ping():
    return {"message": "pong"}