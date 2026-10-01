from datetime import datetime, timezone
from fastapi import APIRouter, Cookie, Depends, HTTPException, Response, status
from sqlalchemy import delete
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from config import settings
from database import get_session
from dependencies import get_current_user
from models import User, RefreshToken
from schemas import UserCreate, UserLogin, UserRead, Token, ChangePasswordRequest
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
        secure=settings.cookie_secure,  # 【關卡 2】改從設定讀：本機 http 用 False，正式環境 True
        max_age=settings.refresh_token_expire_days * 24 * 3600,  # 天數換算成秒
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


async def revoke_all_refresh_tokens(session: AsyncSession, user_id: int) -> None:
    """【關卡 3】刪掉某個使用者的所有 refresh token = 所有裝置都要重新登入
    （重複使用偵測、登出所有裝置、改密碼都會用到，所以抽成共用函式）
    注意：只有排進待辦，呼叫的人要自己 commit
    """
    await session.exec(delete(RefreshToken).where(RefreshToken.user_id == user_id))


async def delete_expired_refresh_tokens(session: AsyncSession, user_id: int) -> None:
    """【關卡 3】清掉某個使用者已過期的 refresh token
    過期的 token 不管有沒有 revoked 都不能用了，留著只是佔空間
    """
    await session.exec(
        delete(RefreshToken).where(
            RefreshToken.user_id == user_id,
            RefreshToken.expires_at < datetime.now(timezone.utc),
        )
    )


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

    # 【關卡 3】順便清掉這個使用者過期的 refresh token，避免資料表一直變大
    await delete_expired_refresh_tokens(session, user.id)

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
        await revoke_all_refresh_tokens(session, rt.user_id)
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


@router.post("/logout-all", status_code=status.HTTP_204_NO_CONTENT)
async def logout_all(
    response: Response,
    current_user: User = Depends(get_current_user),  # 需要帶 access token 才能呼叫
    session: AsyncSession = Depends(get_session),
):
    """【關卡 3】登出所有裝置：刪掉這個使用者的所有 refresh token

    ⚠️ 其他裝置手上的 access token 在過期前（最多 JWT_EXPIRE_MINUTES 分鐘）還是能用，
    因為驗證 access token 不查 DB。等它過期、要 refresh 時才會失敗被登出。
    """
    await revoke_all_refresh_tokens(session, current_user.id)
    await session.commit()

    # 這台裝置的 cookie 也清掉
    response.delete_cookie(key="refresh_token", path="/auth")
    return None


@router.post("/change-password", response_model=Token)
async def change_password(
    data: ChangePasswordRequest,
    response: Response,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """【關卡 3】改密碼：成功後其他裝置全部登出，目前這台保持登入"""
    # 1. 確認目前密碼正確
    #    用 400 而不是 401：401 代表「沒登入 / token 失效」，
    #    前端 apiFetch 看到 401 會以為 token 過期而去 refresh，這裡不是那種情況
    if not verify_password(data.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="目前密碼錯誤",
        )

    # 2. 新密碼不能跟舊的一樣
    if data.current_password == data.new_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="新密碼不能和目前密碼相同",
        )

    # commit 之後 current_user 的屬性會過期（關卡 1 的坑），先存起來
    user_id = current_user.id

    # 3. 更新密碼
    current_user.hashed_password = hash_password(data.new_password)

    # 4. 撤銷所有 refresh token → 其他裝置之後 refresh 會失敗、被登出
    #    （密碼可能就是因為外洩才改的，舊的登入狀態都不該再信任）
    await revoke_all_refresh_tokens(session, user_id)

    # 5. 幫目前這台裝置發新的 refresh token，讓使用者不用重新登入
    new_refresh_token = await issue_refresh_token(session, user_id)
    await session.commit()

    set_refresh_cookie(response, new_refresh_token)
    return Token(access_token=create_access_token(user_id))
