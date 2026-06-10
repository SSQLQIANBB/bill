from collections.abc import AsyncGenerator

from sqlalchemy import inspect, text
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings

engine = create_async_engine(settings.sqlalchemy_database_url)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_session() -> AsyncGenerator:
    async with AsyncSessionLocal() as session:
        yield session


async def create_db_and_tables() -> None:
    from app.models.auth import SmsCode, User  # noqa: F401
    from app.models.finance import Transaction  # noqa: F401

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        user_columns = await conn.run_sync(lambda sync_conn: {c["name"] for c in inspect(sync_conn).get_columns("users")})
        if "email" not in user_columns:
            await conn.execute(text("ALTER TABLE users ADD COLUMN email VARCHAR(255) NULL"))
            await conn.execute(text("CREATE UNIQUE INDEX ix_users_email ON users (email)"))
        if "password_hash" not in user_columns:
            await conn.execute(text("ALTER TABLE users ADD COLUMN password_hash VARCHAR(255) NULL"))
