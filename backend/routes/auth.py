from datetime import datetime, timezone
from fastapi import APIRouter, Cookie, Depends, HTTPException, Response, status
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from database import get_session
from models import User, RefreshToken
from schemas import UserCreate, UserRead, Token
from security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    refresh_token_expiry,
)


router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def register(
    data: UserCreate,
    session: AsyncSession = Depends(get_session),
):
    # 檢查 email 是否已存在
    result = await session.exec(select(User).where(User.email == data.email))
    existing = result.first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    # 建立新用戶
    user = User(
        email=data.email,
        hashed_password=hash_password(data.password),
    )
    session.add(user)
    await session.commit()
    await session.refresh(user)
    return user

@router.post("/login", response_model=Token)
async def login(
    data: UserCreate,
    response: Response,
    session: AsyncSession = Depends(get_session),
):
    # 查用戶
    result = await session.exec(select(User).where(User.email == data.email))
    user = result.first()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    # 簽 access token
    access_token = create_access_token(user.id)

    # 產生並儲存 refresh token
    refresh_token_str = create_refresh_token()
    rt = RefreshToken(
        token=refresh_token_str,
        user_id=user.id,
        expires_at=refresh_token_expiry(),
    )
    session.add(rt)
    await session.commit()

    # 設 httpOnly cookie
    response.set_cookie(
        key="refresh_token",
        value=refresh_token_str,
        httponly=True,        # JS 讀不到
        samesite="lax",       # 防 CSRF
        secure=False,         # 本機是 http，正式環境改 True
        max_age=7 * 24 * 3600,  # 7 天（秒）
        path="/auth",         # 只在 /auth/* 路徑帶上
    )

    return Token(access_token=access_token)


@router.post("/refresh", response_model=Token)
async def refresh(
    refresh_token: str | None = Cookie(default=None),
    session: AsyncSession = Depends(get_session),
):
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No refresh token",
        )

    # 查 DB
    result = await session.exec(
        select(RefreshToken).where(RefreshToken.token == refresh_token)
    )
    rt = result.first()

    if not rt:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )

    # 檢查過期
    if rt.expires_at < datetime.now(timezone.utc):
        await session.delete(rt)
        await session.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token expired",
        )

    # 簽新的 access token
    access_token = create_access_token(rt.user_id)
    return Token(access_token=access_token)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(
    response: Response,
    refresh_token: str | None = Cookie(default=None),
    session: AsyncSession = Depends(get_session),
):
    # 刪掉 DB 裡的 refresh token
    if refresh_token:
        result = await session.exec(
            select(RefreshToken).where(RefreshToken.token == refresh_token)
        )
        rt = result.first()
        if rt:
            await session.delete(rt)
            await session.commit()

    # 清掉 cookie
    response.delete_cookie(
        key="refresh_token",
        path="/auth",
    )

    return None