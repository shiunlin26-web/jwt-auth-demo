from sqlalchemy.ext.asyncio import create_async_engine
from sqlmodel.ext.asyncio.session import AsyncSession

from config import settings

# 【關卡 10】Neon 的 pooled 連線字串（主機名稱含 "-pooler"）背後是 PgBouncer，
# 它不支援 asyncpg 預設的 prepared statement 快取，要關掉，否則會隨機出現
# "prepared statement ... already exists" 的錯誤。用直連字串就不需要。
connect_args = {"statement_cache_size": 0} if "-pooler" in settings.database_url else {}

# 【關卡 2】設定改從 config.py 讀；echo 預設關閉（要看 SQL 就在 .env 設 DB_ECHO=true）
# 【關卡 10】pool_pre_ping=True：從連線池拿連線出來用之前，先發一個很便宜的查詢確認它還活著。
# Neon 免費方案閒置 5 分鐘會休眠，休眠前建立的連線都會死掉；沒有這個設定，
# 休眠後的第一個請求會拿到死連線，直接 500（connection is closed）。
engine = create_async_engine(
    settings.database_url,
    echo=settings.db_echo,
    pool_pre_ping=True,
    connect_args=connect_args,
)

async def get_session() -> AsyncSession:
    async with AsyncSession(engine) as session:
        yield session
