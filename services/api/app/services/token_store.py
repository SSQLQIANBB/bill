import json

from redis.asyncio import Redis
from redis.exceptions import RedisError

from app.core.config import settings
from app.core.errors import AuthError
from app.core.security import create_refresh_token, hash_token

_redis: Redis | None = None


def get_redis() -> Redis:
    global _redis
    if _redis is None:
        _redis = Redis.from_url(settings.redis_url, decode_responses=True)
    return _redis


async def close_redis() -> None:
    if _redis is not None:
        await _redis.aclose()


def refresh_token_key(refresh_token: str) -> str:
    return f"auth:refresh:{hash_token(refresh_token)}"


async def issue_refresh_token(user_id: int) -> str:
    refresh_token = create_refresh_token()
    key = refresh_token_key(refresh_token)
    ttl = settings.refresh_token_expire_days * 24 * 60 * 60
    payload = {"userId": user_id}
    try:
        await get_redis().set(key, json.dumps(payload), ex=ttl)
    except RedisError as exc:
        raise AuthError("AUTH_CACHE_ERROR", "登录服务异常，请稍后重试", 500) from exc
    return refresh_token


async def consume_refresh_token(refresh_token: str) -> int:
    if not refresh_token:
        raise AuthError("AUTH_REFRESH_TOKEN_INVALID", "登录状态无效，请重新登录", 401)

    key = refresh_token_key(refresh_token)
    try:
        raw = await get_redis().get(key)
        if not raw:
            raise AuthError("AUTH_REFRESH_TOKEN_EXPIRED", "登录已过期，请重新登录", 401)
        await get_redis().delete(key)
    except AuthError:
        raise
    except RedisError as exc:
        raise AuthError("AUTH_CACHE_ERROR", "登录服务异常，请稍后重试", 500) from exc

    try:
        user_id = int(json.loads(raw)["userId"])
    except (KeyError, TypeError, ValueError, json.JSONDecodeError) as exc:
        raise AuthError("AUTH_REFRESH_TOKEN_INVALID", "登录状态无效，请重新登录", 401) from exc
    return user_id


async def revoke_refresh_token(refresh_token: str) -> None:
    if not refresh_token:
        return
    try:
        await get_redis().delete(refresh_token_key(refresh_token))
    except RedisError as exc:
        raise AuthError("AUTH_CACHE_ERROR", "登录服务异常，请稍后重试", 500) from exc
