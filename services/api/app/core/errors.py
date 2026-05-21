from typing import Any

from fastapi import HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse


class ApiError(Exception):
    def __init__(self, code: str, message: str, status_code: int = status.HTTP_400_BAD_REQUEST) -> None:
        self.code = code
        self.message = message
        self.status_code = status_code


class AuthError(ApiError):
    pass


def api_response(code: str, message: str, data: Any = None) -> dict[str, Any]:
    return {"code": code, "message": message, "data": data}


async def api_error_handler(_: Request, exc: ApiError) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content=api_response(exc.code, exc.message),
    )


async def http_error_handler(_: Request, exc: HTTPException) -> JSONResponse:
    detail = exc.detail if isinstance(exc.detail, dict) else {}
    code = detail.get("code") or _default_code_for_status(exc.status_code)
    message = detail.get("message") or (exc.detail if isinstance(exc.detail, str) else "请求失败")
    return JSONResponse(
        status_code=exc.status_code,
        content=api_response(code, str(message)),
    )


async def validation_error_handler(_: Request, exc: RequestValidationError) -> JSONResponse:
    code = "VALIDATION_ERROR"
    message = "请求参数不正确"

    first = exc.errors()[0] if exc.errors() else {}
    loc = first.get("loc", [])
    field = loc[-1] if loc else None
    if field == "account":
        code = "AUTH_ACCOUNT_REQUIRED"
        message = "请输入账号"
    elif field == "password":
        code = "AUTH_PASSWORD_REQUIRED"
        message = "请输入密码"
    elif field == "refreshToken":
        code = "AUTH_REFRESH_TOKEN_INVALID"
        message = "登录状态无效，请重新登录"

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=api_response(code, message),
    )


async def unhandled_error_handler(_: Request, __: Exception) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=api_response("INTERNAL_SERVER_ERROR", "系统异常，请稍后重试"),
    )


def _default_code_for_status(status_code: int) -> str:
    if status_code == status.HTTP_401_UNAUTHORIZED:
        return "AUTH_TOKEN_INVALID"
    if status_code == status.HTTP_403_FORBIDDEN:
        return "FORBIDDEN"
    if status_code == status.HTTP_404_NOT_FOUND:
        return "NOT_FOUND"
    return "REQUEST_ERROR"
