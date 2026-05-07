from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Bill API"
    debug: bool = True
    database_url: str = "mysql+aiomysql://bill:bill_password@127.0.0.1:3306/bill"
    jwt_secret: str = "change-me-in-production"
    jwt_expire_minutes: int = 60 * 24 * 30
    wechat_app_id: str = ""
    wechat_app_secret: str = ""
    sms_dev_code: str = "123456"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()
