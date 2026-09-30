from datetime import datetime, timedelta, timezone
import jwt
import bcrypt
import secrets
import hashlib

from config import settings


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(plain: str, hashed: str) -> bool:
    plain_bytes = plain.encode()
    # 【關卡 0】bcrypt 遇到超過 72 bytes 會直接丟錯（→ 500）。
    # 註冊時已經擋掉這種密碼，所以超過的一定是錯的密碼，直接回傳 False
    if len(plain_bytes) > 72:
        return False
    return bcrypt.checkpw(plain_bytes, hashed.encode())


def create_access_token(user_id: int) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.jwt_expire_minutes)
    payload = {
        "sub": str(user_id),
        "exp": expire,
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> dict:
    return jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])


def create_refresh_token() -> str:
    """產生一個隨機的 refresh token 字串"""
    return secrets.token_urlsafe(32)


def refresh_token_expiry() -> datetime:
    return datetime.now(timezone.utc) + timedelta(days=settings.refresh_token_expire_days)


def hash_token(token: str) -> str:
    """【關卡 1】refresh token 存進 DB 前先做 SHA-256 雜湊。
    DB 外洩時，攻擊者只拿到雜湊值，無法反推出原本的 token 拿去用。
    （token 本身是 32 bytes 隨機字串，猜不到，所以用快速的 SHA-256 就夠，不需要 bcrypt）
    """
    return hashlib.sha256(token.encode()).hexdigest()
