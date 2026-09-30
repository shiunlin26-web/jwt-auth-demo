from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, field_validator

# bcrypt 最多只能處理 72 個 bytes（不是 72 個字元）
BCRYPT_MAX_BYTES = 72

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)

    # 【關卡 0】Field(max_length=72) 算的是「字元數」，但 bcrypt 限制的是「bytes」。
    # 中文字在 UTF-8 佔 3 bytes，30 個中文字 = 90 bytes → bcrypt 會丟錯變成 500。
    # 所以改用自訂驗證器，自己算 bytes 長度。
    @field_validator("password")  # 這個函式負責驗證 password 欄位
    @classmethod                  # Pydantic 規定驗證器要是 classmethod
    def check_password_bytes(cls, v: str) -> str:
        # v 是使用者送進來的密碼；.encode("utf-8") 把字串轉成 bytes
        if len(v.encode("utf-8")) > BCRYPT_MAX_BYTES:
            # raise ValueError → FastAPI 自動回 422，並把訊息放在 detail 裡
            raise ValueError(f"密碼太長：最多 {BCRYPT_MAX_BYTES} bytes（中文字一個算 3 bytes）")
        return v  # 驗證通過要把值回傳，否則欄位會變成 None

class UserRead(BaseModel):
    id: int
    email: str
    created_at: datetime

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
