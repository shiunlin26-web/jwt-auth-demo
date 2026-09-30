import re
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, field_validator

# 【關卡 0】密碼規則：8～72 個「可列印的 ASCII 字元」
# 也就是英文大小寫、數字、空白和鍵盤上的符號（!@#$% 之類），不接受中文、emoji。
# - 為什麼是 72：bcrypt 最多只能處理 72 個 bytes；ASCII 一個字元剛好 1 byte，
#   所以 72 個字元 = 72 bytes，不會超過（中文一個字 3 bytes，就會出問題）
# - 為什麼不收中文：換裝置或輸入法時容易打不出來，也有 Unicode 正規化的麻煩
PASSWORD_MIN_LENGTH = 8
PASSWORD_MAX_LENGTH = 72
PRINTABLE_ASCII = re.compile(r"^[\x20-\x7E]+$")  # \x20 是空白，\x7E 是 ~


class UserCreate(BaseModel):
    """註冊用：套用完整的密碼規則"""
    email: EmailStr
    password: str = Field(min_length=PASSWORD_MIN_LENGTH, max_length=PASSWORD_MAX_LENGTH)

    @field_validator("password")  # 這個函式負責驗證 password 欄位
    @classmethod                  # Pydantic 規定驗證器要是 classmethod
    def check_password_chars(cls, v: str) -> str:
        # re.match 比對成功回傳物件、失敗回傳 None；not None → True
        if not PRINTABLE_ASCII.match(v):
            # raise ValueError → FastAPI 自動回 422，並把訊息放在 detail 裡
            raise ValueError("密碼只能包含英文字母、數字、空白與符號")
        return v  # 驗證通過要把值回傳，否則欄位會變成 None


class UserLogin(BaseModel):
    """登入用：不套用密碼規則，只要有填就好

    規則只在「設定密碼」時檢查。登入時如果也檢查，
    哪天規則改了，用舊規則註冊的人就再也登不進來了。
    密碼對不對，交給 verify_password 判斷就好。
    """
    email: EmailStr
    password: str


class UserRead(BaseModel):
    id: int
    email: str
    created_at: datetime


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
