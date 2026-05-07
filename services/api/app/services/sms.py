from datetime import timedelta

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.auth import SmsCode, utc_now


async def create_sms_code(session: AsyncSession, phone: str) -> SmsCode:
    code = settings.sms_dev_code
    sms_code = SmsCode(phone=phone, code=code, expires_at=utc_now() + timedelta(minutes=5))
    session.add(sms_code)
    await session.commit()
    await session.refresh(sms_code)
    return sms_code


async def verify_sms_code(session: AsyncSession, phone: str, code: str) -> bool:
    result = await session.execute(
        select(SmsCode)
        .where(SmsCode.phone == phone, SmsCode.used.is_(False))
        .order_by(SmsCode.created_at.desc())
        .limit(1)
    )
    sms_code = result.scalar_one_or_none()
    if not sms_code:
        return False
    if sms_code.expires_at < utc_now() or sms_code.code != code:
        return False
    sms_code.used = True
    await session.commit()
    return True
