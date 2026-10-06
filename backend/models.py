from datetime import datetime, timezone
from sqlmodel import SQLModel, Field

class User(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    hashed_password: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    # 【關卡 5】最後登入時間。用 Alembic 遷移新增的欄位（0002），不用刪表重建
    # 舊資料沒有這個值，所以要允許 None（資料庫裡是 NULL）
    last_login_at: datetime | None = None

class RefreshToken(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    # 【關卡 1】DB 只存雜湊，不存原始 token（原本欄位叫 token）
    token_hash: str = Field(unique=True, index=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    # 【關卡 1】用過（換過新 token）就設成 True。
    # 不直接刪掉，是為了之後有人拿舊 token 來時，能認出「這是用過的」→ 偵測被盜用
    revoked: bool = Field(default=False)
    expires_at: datetime
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))