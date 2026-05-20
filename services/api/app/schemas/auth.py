from pydantic import BaseModel, Field


class SmsSendRequest(BaseModel):
    phone: str = Field(min_length=6, max_length=32)


class SmsLoginRequest(BaseModel):
    phone: str = Field(min_length=6, max_length=32)
    code: str = Field(min_length=4, max_length=12)


class PasswordLoginRequest(BaseModel):
    account: str = Field(min_length=6, max_length=255)
    password: str = Field(min_length=8, max_length=128)


class RegisterRequest(BaseModel):
    phone: str = Field(min_length=6, max_length=32)
    code: str = Field(min_length=4, max_length=12)
    password: str = Field(min_length=8, max_length=128)
    nickname: str | None = Field(default=None, max_length=64)


class WechatLoginRequest(BaseModel):
    code: str = Field(min_length=3, max_length=256)


class UserOut(BaseModel):
    id: int
    phone: str | None = None
    email: str | None = None
    nickname: str | None = None
    avatarUrl: str | None = None


class TokenOut(BaseModel):
    accessToken: str
    tokenType: str = "bearer"
    user: UserOut
