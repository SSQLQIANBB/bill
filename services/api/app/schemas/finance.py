from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field


class TransactionBase(BaseModel):
    title: str = Field(min_length=1, max_length=128)
    amount: Decimal
    kind: str = Field(pattern="^(income|expense)$")
    category: str = Field(default="未分类", max_length=64)
    channel: str = Field(default="手动", max_length=64)
    status: str = Field(default="已分类", max_length=32)
    note: str | None = None
    occurredAt: datetime | None = None


class TransactionCreate(TransactionBase):
    pass


class TransactionUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=128)
    amount: Decimal | None = None
    kind: str | None = Field(default=None, pattern="^(income|expense)$")
    category: str | None = Field(default=None, max_length=64)
    channel: str | None = Field(default=None, max_length=64)
    status: str | None = Field(default=None, max_length=32)
    note: str | None = None
    occurredAt: datetime | None = None


class TransactionOut(BaseModel):
    id: int
    title: str
    amount: Decimal
    kind: str
    category: str
    channel: str
    status: str
    note: str | None = None
    occurredAt: datetime


class CategorySummary(BaseModel):
    category: str
    amount: Decimal
    percent: int


class FinanceSummaryOut(BaseModel):
    income: Decimal
    expense: Decimal
    balance: Decimal
    pendingCount: int
    categories: list[CategorySummary]


class IntegrationOut(BaseModel):
    name: str
    status: str
    syncedToday: int
    enabled: bool
