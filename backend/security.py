import os
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv
import jwt
import bcrypt
import secrets
import hashlib


load_dotenv()

JWT_SECRET = os.getenv("JWT_SECRET")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", "30"))
REFRESH_TOKEN_EXPIRE_DAYS = 7


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())


def create_access_token(user_id: int) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=JWT_EXPIRE_MINUTES)
    payload = {
        "sub": str(user_id),
        "exp": expire,
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_access_token(token: str) -> dict:
    return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])


def create_refresh_token() -> str:
    """產生一個隨機的 refresh token 字串"""
    return secrets.token_urlsafe(32)


def refresh_token_expiry() -> datetime:
    return datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)


def hash_token(token: str) -> str:
    """【關卡 1】refresh token 存進 DB 前先做 SHA-256 雜湊。
    DB 外洩時，攻擊者只拿到雜湊值，無法反推出原本的 token 拿去用。
    （token 本身是 32 bytes 隨機字串，猜不到，所以用快速的 SHA-256 就夠，不需要 bcrypt）
    """
    return hashlib.sha256(token.encode()).hexdigest()
