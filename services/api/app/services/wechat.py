from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.auth import User


async def resolve_wechat_openid(code: str) -> str:
    if not settings.wechat_app_id or not settings.wechat_app_secret:
        return f"dev-openid-{code}"

    # Production wiring belongs here: call WeChat jscode2session/oauth endpoint,
    # validate errcode, then return openid/unionid.
    return f"pending-real-wechat-{code}"


async def get_or_create_wechat_user(session: AsyncSession, code: str) -> User:
    openid = await resolve_wechat_openid(code)
    result = await session.execute(select(User).where(User.wechat_openid == openid))
    user = result.scalar_one_or_none()
    if user:
        return user

    user = User(wechat_openid=openid, nickname="微信用户")
    session.add(user)
    await session.commit()
    await session.refresh(user)
    return user
