from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from database import get_session
from models import User
from schemas import UserCreate, UserRead, Token
from security import hash_password, verify_password, create_access_token

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

    # 簽 JWT
    token = create_access_token(user.id)
    return Token(access_token=token)