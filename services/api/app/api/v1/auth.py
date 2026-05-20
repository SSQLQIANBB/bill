from fastapi import APIRouter, Depends, HTTPException, Header, status
from jose import JWTError
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_access_token, decode_access_token, hash_password, verify_password
from app.db.session import get_session
from app.models.auth import User
from app.schemas.auth import (
    PasswordLoginRequest,
    RegisterRequest,
    SmsLoginRequest,
    SmsSendRequest,
    TokenOut,
    UserOut,
    WechatLoginRequest,
)
from app.services.sms import create_sms_code, verify_sms_code
from app.services.wechat import get_or_create_wechat_user

router = APIRouter()


def to_user_out(user: User) -> UserOut:
    return UserOut(
        id=user.id,
        phone=user.phone,
        email=user.email,
        nickname=user.nickname,
        avatarUrl=user.avatar_url,
    )


def to_token(user: User) -> TokenOut:
    return TokenOut(accessToken=create_access_token(str(user.id)), user=to_user_out(user))


async def get_current_user(
    authorization: str | None = Header(default=None),
    session: AsyncSession = Depends(get_session),
) -> User:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="未登录")

    token = authorization.split(" ", 1)[1]
    try:
        payload = decode_access_token(token)
        user_id = int(payload["sub"])
    except (JWTError, KeyError, ValueError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="登录已过期") from None

    user = await session.get(User, user_id)
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="用户不可用")
    return user


@router.post("/sms/send")
async def send_sms(payload: SmsSendRequest, session: AsyncSession = Depends(get_session)) -> dict[str, str]:
    await create_sms_code(session, payload.phone)
    return {"message": "sent"}


@router.post("/sms/login", response_model=TokenOut)
async def sms_login(payload: SmsLoginRequest, session: AsyncSession = Depends(get_session)) -> TokenOut:
    ok = await verify_sms_code(session, payload.phone, payload.code)
    if not ok:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="验证码错误或已过期")

    result = await session.execute(select(User).where(User.phone == payload.phone))
    user = result.scalar_one_or_none()
    if not user:
        user = User(phone=payload.phone, nickname="手机用户")
        session.add(user)
        await session.commit()
        await session.refresh(user)

    return to_token(user)


@router.post("/register", response_model=TokenOut, status_code=status.HTTP_201_CREATED)
async def register(payload: RegisterRequest, session: AsyncSession = Depends(get_session)) -> TokenOut:
    ok = await verify_sms_code(session, payload.phone, payload.code)
    if not ok:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="验证码错误或已过期")

    result = await session.execute(select(User).where(User.phone == payload.phone))
    user = result.scalar_one_or_none()
    if user and user.password_hash:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="该手机号已注册")

    if not user:
        user = User(phone=payload.phone)
        session.add(user)

    user.password_hash = hash_password(payload.password)
    user.nickname = payload.nickname or user.nickname or "手机用户"
    await session.commit()
    await session.refresh(user)
    return to_token(user)


@router.post("/login", response_model=TokenOut)
async def password_login(payload: PasswordLoginRequest, session: AsyncSession = Depends(get_session)) -> TokenOut:
    result = await session.execute(
        select(User).where(or_(User.phone == payload.account, User.email == payload.account))
    )
    user = result.scalar_one_or_none()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="账号或密码错误")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="账号已停用")
    return to_token(user)


@router.post("/wechat", response_model=TokenOut)
async def wechat_login(payload: WechatLoginRequest, session: AsyncSession = Depends(get_session)) -> TokenOut:
    user = await get_or_create_wechat_user(session, payload.code)
    return to_token(user)


@router.get("/me", response_model=UserOut)
async def me(user: User = Depends(get_current_user)) -> UserOut:
    return to_user_out(user)
