import re

from fastapi import APIRouter, Depends, Header, status
from jose import ExpiredSignatureError, JWTError
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.errors import AuthError, api_response
from app.core.security import create_access_token, decode_access_token, hash_password, verify_password
from app.db.session import get_session
from app.models.auth import User
from app.schemas.auth import (
    ApiResponse,
    LogoutRequest,
    PasswordLoginRequest,
    RefreshRequest,
    RegisterRequest,
    SmsLoginRequest,
    SmsSendRequest,
    TokenOut,
    UserOut,
    WechatLoginRequest,
)
from app.services.sms import create_sms_code, verify_sms_code
from app.services.token_store import consume_refresh_token, issue_refresh_token, revoke_refresh_token
from app.services.wechat import get_or_create_wechat_user

router = APIRouter()

MAINLAND_PHONE_RE = re.compile(r"^1[3-9]\d{9}$")
EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def to_user_out(user: User) -> UserOut:
    return UserOut(
        id=user.id,
        phone=user.phone,
        email=user.email,
        nickname=user.nickname,
        avatarUrl=user.avatar_url,
    )


async def to_token(user: User) -> TokenOut:
    refresh_token = await issue_refresh_token(user.id)
    return TokenOut(
        accessToken=create_access_token(str(user.id)),
        refreshToken=refresh_token,
        expiresIn=settings.access_token_expire_days * 24 * 60 * 60,
    )


def success(code: str, message: str, data=None):
    return api_response(code, message, data)


async def get_current_user(
    authorization: str | None = Header(default=None),
    session: AsyncSession = Depends(get_session),
) -> User:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise AuthError("AUTH_TOKEN_MISSING", "请先登录", status.HTTP_401_UNAUTHORIZED)

    token = authorization.split(" ", 1)[1].strip()
    if not token:
        raise AuthError("AUTH_TOKEN_MISSING", "请先登录", status.HTTP_401_UNAUTHORIZED)

    try:
        payload = decode_access_token(token)
        user_id = int(payload["sub"])
    except ExpiredSignatureError:
        raise AuthError("AUTH_TOKEN_EXPIRED", "登录已过期，请重新登录", status.HTTP_401_UNAUTHORIZED) from None
    except (JWTError, KeyError, ValueError):
        raise AuthError("AUTH_TOKEN_INVALID", "登录状态无效", status.HTTP_401_UNAUTHORIZED) from None

    user = await session.get(User, user_id)
    if not user or not user.is_active:
        raise AuthError("AUTH_TOKEN_INVALID", "登录状态无效", status.HTTP_401_UNAUTHORIZED)
    return user


@router.post("/sms/send", response_model=ApiResponse[dict[str, str]])
async def send_sms(payload: SmsSendRequest, session: AsyncSession = Depends(get_session)):
    await create_sms_code(session, payload.phone)
    return success("SMS_CODE_SENT", "验证码已发送", {"message": "sent"})


@router.post("/sms/login", response_model=ApiResponse[TokenOut])
async def sms_login(payload: SmsLoginRequest, session: AsyncSession = Depends(get_session)):
    ok = await verify_sms_code(session, payload.phone, payload.code)
    if not ok:
        raise AuthError("AUTH_SMS_CODE_INVALID", "验证码错误或已过期", status.HTTP_400_BAD_REQUEST)

    result = await session.execute(select(User).where(User.phone == payload.phone))
    user = result.scalar_one_or_none()
    if not user:
        user = User(phone=payload.phone, nickname="手机用户")
        session.add(user)
        await session.commit()
        await session.refresh(user)

    return success("AUTH_LOGIN_SUCCESS", "登录成功", await to_token(user))


@router.post("/register", response_model=ApiResponse[TokenOut], status_code=status.HTTP_201_CREATED)
async def register(payload: RegisterRequest, session: AsyncSession = Depends(get_session)):
    ok = await verify_sms_code(session, payload.phone, payload.code)
    if not ok:
        raise AuthError("AUTH_SMS_CODE_INVALID", "验证码错误或已过期", status.HTTP_400_BAD_REQUEST)

    result = await session.execute(select(User).where(User.phone == payload.phone))
    user = result.scalar_one_or_none()
    if user and user.password_hash:
        raise AuthError("AUTH_ACCOUNT_EXISTS", "该手机号已注册", status.HTTP_409_CONFLICT)

    if not user:
        user = User(phone=payload.phone)
        session.add(user)

    user.password_hash = hash_password(payload.password)
    user.nickname = payload.nickname or user.nickname or "手机用户"
    await session.commit()
    await session.refresh(user)
    return success("AUTH_REGISTER_SUCCESS", "注册成功", await to_token(user))


@router.post("/login", response_model=ApiResponse[TokenOut])
async def password_login(payload: PasswordLoginRequest, session: AsyncSession = Depends(get_session)):
    account = payload.account.strip()
    password = payload.password
    account_filter = _build_account_filter(account)

    if not password:
        raise AuthError("AUTH_PASSWORD_REQUIRED", "请输入密码", status.HTTP_400_BAD_REQUEST)

    result = await session.execute(select(User).where(account_filter))
    user = result.scalar_one_or_none()
    if not user:
        raise AuthError("AUTH_ACCOUNT_NOT_FOUND", "账号不存在", status.HTTP_401_UNAUTHORIZED)
    if not user.password_hash or not verify_password(password, user.password_hash):
        raise AuthError("AUTH_PASSWORD_INVALID", "密码错误", status.HTTP_401_UNAUTHORIZED)
    if not user.is_active:
        raise AuthError("AUTH_ACCOUNT_DISABLED", "账号已停用", status.HTTP_403_FORBIDDEN)
    return success("AUTH_LOGIN_SUCCESS", "登录成功", await to_token(user))


@router.post("/wechat", response_model=ApiResponse[TokenOut])
async def wechat_login(payload: WechatLoginRequest, session: AsyncSession = Depends(get_session)):
    user = await get_or_create_wechat_user(session, payload.code)
    return success("AUTH_LOGIN_SUCCESS", "登录成功", await to_token(user))


@router.post("/refresh", response_model=ApiResponse[TokenOut])
async def refresh_token(payload: RefreshRequest, session: AsyncSession = Depends(get_session)):
    user_id = await consume_refresh_token(payload.refreshToken)
    user = await session.get(User, user_id)
    if not user or not user.is_active:
        raise AuthError("AUTH_REFRESH_TOKEN_INVALID", "登录状态无效，请重新登录", status.HTTP_401_UNAUTHORIZED)
    return success("AUTH_REFRESH_SUCCESS", "刷新成功", await to_token(user))


@router.post("/logout", response_model=ApiResponse[None])
async def logout(payload: LogoutRequest):
    await revoke_refresh_token(payload.refreshToken)
    return success("AUTH_LOGOUT_SUCCESS", "已退出登录")


@router.get("/me", response_model=ApiResponse[UserOut])
async def me(user: User = Depends(get_current_user)):
    return success("USER_PROFILE_SUCCESS", "获取用户信息成功", to_user_out(user))


def _build_account_filter(account: str):
    if not account:
        raise AuthError("AUTH_ACCOUNT_REQUIRED", "请输入账号", status.HTTP_400_BAD_REQUEST)

    if MAINLAND_PHONE_RE.fullmatch(account):
        return User.phone == account
    if EMAIL_RE.fullmatch(account):
        return User.email == account

    raise AuthError("AUTH_ACCOUNT_INVALID", "账号格式不正确", status.HTTP_400_BAD_REQUEST)
