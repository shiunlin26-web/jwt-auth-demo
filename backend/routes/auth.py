from datetime import datetime, timezone
from fastapi import APIRouter, Cookie, Depends, HTTPException, Response, status
from sqlalchemy import delete
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from database import get_session
from models import User, RefreshToken
from schemas import UserCreate, UserLogin, UserRead, Token
from security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    refresh_token_expiry,
    hash_token,
)


router = APIRouter(prefix="/auth", tags=["auth"])


def set_refresh_cookie(response: Response, token: str) -> None:
    """【關卡 1】login 和 refresh 都要設 cookie，抽成共用函式"""
    response.set_cookie(
        key="refresh_token",
        value=token,
        httponly=True,        # JS 讀不到
        samesite="lax",       # 防 CSRF
        secure=False,         # 本機是 http，正式環境改 True
        max_age=7 * 24 * 3600,  # 7 天（秒）
        path="/auth",         # 只在 /auth/* 路徑帶上
    )


async def issue_refresh_token(session: AsyncSession, user_id: int) -> str:
    """【關卡 1】產生新的 refresh token，DB 存雜湊，回傳原始字串（要放進 cookie）"""
    token = create_refresh_token()
    session.add(
        RefreshToken(
            token_hash=hash_token(token),
            user_id=user_id,
            expires_at=refresh_token_expiry(),
        )
    )
    return token


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
    data: UserLogin,  # 【關卡 0】登入改用 UserLogin，不套用註冊的密碼規則
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
    refresh_token = await issue_refresh_token(session, user.id)
    await session.commit()

    set_refresh_cookie(response, refresh_token)
    return Token(access_token=access_token)


@router.post("/refresh", response_model=Token)
async def refresh(
    response: Response,  # 【關卡 1】新增：要用它設定新的 cookie
    refresh_token: str | None = Cookie(default=None),
    session: AsyncSession = Depends(get_session),
):
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No refresh token",
        )

    # 查 DB：先雜湊再比對
    # with_for_update() 會把這一列鎖住直到 commit，
    # 同一個 token 同時來兩個請求時，第二個會等第一個做完才讀，不會兩個都換成功
    result = await session.exec(
        select(RefreshToken)
        .where(RefreshToken.token_hash == hash_token(refresh_token))
        .with_for_update()
    )
    rt = result.first()

    if not rt:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )

    # 【關卡 1】重複使用偵測：這個 token 已經換過了，卻又被拿來用
    # → 可能被偷了（正常使用者手上只會有最新的那個）
    # → 把這個使用者所有 refresh token 全刪掉，所有裝置都要重新登入
    if rt.revoked:
        await session.execute(
            delete(RefreshToken).where(RefreshToken.user_id == rt.user_id)
        )
        await session.commit()  # 一定要在 raise 前 commit，raise 之後的程式碼不會執行
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token reused",
        )

    # 檢查過期
    if rt.expires_at < datetime.now(timezone.utc):
        await session.delete(rt)
        await session.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token expired",
        )

    # ⚠️ 先把 user_id 存到變數：commit() 之後 rt 的屬性會「過期」，
    # 再讀 rt.user_id 會觸發重新查 DB，在 async 裡會丟 MissingGreenlet 錯誤（500）
    user_id = rt.user_id

    # 【關卡 1】輪替：舊的作廢、發一個新的
    rt.revoked = True
    new_refresh_token = await issue_refresh_token(session, user_id)
    await session.commit()

    set_refresh_cookie(response, new_refresh_token)

    # 簽新的 access token
    access_token = create_access_token(user_id)
    return Token(access_token=access_token)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(
    response: Response,
    refresh_token: str | None = Cookie(default=None),
    session: AsyncSession = Depends(get_session),
):
    # 刪掉 DB 裡的 refresh token（一樣先雜湊再查）
    if refresh_token:
        result = await session.exec(
            select(RefreshToken).where(RefreshToken.token_hash == hash_token(refresh_token))
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
