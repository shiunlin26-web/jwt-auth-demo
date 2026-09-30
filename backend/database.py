from sqlalchemy.ext.asyncio import create_async_engine
from sqlmodel.ext.asyncio.session import AsyncSession

from config import settings

# 【關卡 2】設定改從 config.py 讀；echo 預設關閉（要看 SQL 就在 .env 設 DB_ECHO=true）
engine = create_async_engine(settings.database_url, echo=settings.db_echo)

async def get_session() -> AsyncSession:
    async with AsyncSession(engine) as session:
        yield session
