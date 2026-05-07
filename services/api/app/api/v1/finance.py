from collections import defaultdict
from datetime import datetime
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import decode_access_token
from app.db.session import get_session
from app.models.auth import User
from app.models.finance import Transaction
from app.schemas.finance import (
    CategorySummary,
    FinanceSummaryOut,
    IntegrationOut,
    TransactionCreate,
    TransactionOut,
    TransactionUpdate,
)

router = APIRouter()
bearer = HTTPBearer()


async def current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer),
    session: AsyncSession = Depends(get_session),
) -> User:
    try:
        payload = decode_access_token(credentials.credentials)
        user_id = int(payload["sub"])
    except (JWTError, KeyError, ValueError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="登录已失效")

    user = await session.get(User, user_id)
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="用户不存在")
    return user


def to_out(item: Transaction) -> TransactionOut:
    return TransactionOut(
        id=item.id,
        title=item.title,
        amount=item.amount,
        kind=item.kind,
        category=item.category,
        channel=item.channel,
        status=item.status,
        note=item.note,
        occurredAt=item.occurred_at,
    )


@router.get("/transactions", response_model=list[TransactionOut])
async def list_transactions(
    category: str | None = Query(default=None),
    channel: str | None = Query(default=None),
    status_filter: str | None = Query(default=None, alias="status"),
    session: AsyncSession = Depends(get_session),
    user: User = Depends(current_user),
) -> list[TransactionOut]:
    stmt = select(Transaction).where(Transaction.user_id == user.id).order_by(Transaction.occurred_at.desc())
    if category:
        stmt = stmt.where(Transaction.category == category)
    if channel:
        stmt = stmt.where(Transaction.channel == channel)
    if status_filter:
        stmt = stmt.where(Transaction.status == status_filter)
    result = await session.execute(stmt)
    return [to_out(item) for item in result.scalars().all()]


@router.post("/transactions", response_model=TransactionOut, status_code=status.HTTP_201_CREATED)
async def create_transaction(
    payload: TransactionCreate,
    session: AsyncSession = Depends(get_session),
    user: User = Depends(current_user),
) -> TransactionOut:
    item = Transaction(
        user_id=user.id,
        title=payload.title,
        amount=abs(payload.amount),
        kind=payload.kind,
        category=payload.category,
        channel=payload.channel,
        status=payload.status,
        note=payload.note,
        occurred_at=payload.occurredAt or datetime.utcnow(),
    )
    session.add(item)
    await session.commit()
    await session.refresh(item)
    return to_out(item)


@router.patch("/transactions/{transaction_id}", response_model=TransactionOut)
async def update_transaction(
    transaction_id: int,
    payload: TransactionUpdate,
    session: AsyncSession = Depends(get_session),
    user: User = Depends(current_user),
) -> TransactionOut:
    item = await session.get(Transaction, transaction_id)
    if not item or item.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="流水不存在")

    updates = payload.model_dump(exclude_unset=True)
    field_map = {"occurredAt": "occurred_at"}
    for key, value in updates.items():
        if key == "amount" and value is not None:
            value = abs(value)
        setattr(item, field_map.get(key, key), value)
    await session.commit()
    await session.refresh(item)
    return to_out(item)


@router.delete("/transactions/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_transaction(
    transaction_id: int,
    session: AsyncSession = Depends(get_session),
    user: User = Depends(current_user),
) -> None:
    item = await session.get(Transaction, transaction_id)
    if not item or item.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="流水不存在")
    await session.delete(item)
    await session.commit()


@router.get("/summary", response_model=FinanceSummaryOut)
async def get_summary(
    session: AsyncSession = Depends(get_session),
    user: User = Depends(current_user),
) -> FinanceSummaryOut:
    result = await session.execute(select(Transaction).where(Transaction.user_id == user.id))
    items = result.scalars().all()
    income = sum((item.amount for item in items if item.kind == "income"), Decimal("0"))
    expense = sum((item.amount for item in items if item.kind == "expense"), Decimal("0"))
    pending_count = sum(1 for item in items if item.status == "待分类")

    by_category: defaultdict[str, Decimal] = defaultdict(lambda: Decimal("0"))
    for item in items:
        if item.kind == "expense":
            by_category[item.category] += item.amount

    categories = [
        CategorySummary(
            category=category,
            amount=amount,
            percent=int((amount / expense) * 100) if expense else 0,
        )
        for category, amount in sorted(by_category.items(), key=lambda pair: pair[1], reverse=True)
    ]

    return FinanceSummaryOut(
        income=income,
        expense=expense,
        balance=income - expense,
        pendingCount=pending_count,
        categories=categories,
    )


@router.get("/integrations", response_model=list[IntegrationOut])
async def list_integrations(user: User = Depends(current_user)) -> list[IntegrationOut]:
    return [
        IntegrationOut(name="微信支付", status="已授权", syncedToday=18, enabled=True),
        IntegrationOut(name="支付宝", status="待接入", syncedToday=0, enabled=False),
        IntegrationOut(name="银行卡", status="2 张卡片", syncedToday=6, enabled=True),
    ]
