from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_access_token
from app.db.session import get_session
from app.models.auth import User
from app.schemas.auth import SmsLoginRequest, SmsSendRequest, TokenOut, UserOut, WechatLoginRequest
from app.services.sms import create_sms_code, verify_sms_code
from app.services.wechat import get_or_create_wechat_user

router = APIRouter()


def to_token(user: User) -> TokenOut:
    return TokenOut(
        accessToken=create_access_token(str(user.id)),
        user=UserOut(id=user.id, phone=user.phone, nickname=user.nickname, avatarUrl=user.avatar_url),
    )


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


@router.post("/wechat", response_model=TokenOut)
async def wechat_login(payload: WechatLoginRequest, session: AsyncSession = Depends(get_session)) -> TokenOut:
    user = await get_or_create_wechat_user(session, payload.code)
    return to_token(user)
