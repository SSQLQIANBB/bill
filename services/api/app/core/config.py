from pathlib import Path
import os
from urllib.parse import quote_plus

from pydantic_settings import BaseSettings, SettingsConfigDict


API_ROOT = Path(__file__).resolve().parents[2]
APP_ENV = os.getenv("APP_ENV", "development")
ENV_FILE = API_ROOT / f".env.{APP_ENV}"


class Settings(BaseSettings):
    app_env: str = APP_ENV
    app_name: str = "Bill API"
    debug: bool = True
    api_host: str = "127.0.0.1"
    api_port: int = 8000
    api_reload: bool = True
    database_driver: str = "mysql+aiomysql"
    database_url: str = ""
    mysql_image: str = "mysql:8.4"
    mysql_container_name: str = "bill-mysql"
    mysql_host: str = "127.0.0.1"
    mysql_port: int = 3307
    mysql_database: str = "bill"
    mysql_user: str = "bill"
    mysql_password: str = "bill_password"
    mysql_root_password: str = "bill_root"
    jwt_secret: str = "change-me-in-production"
    jwt_expire_minutes: int = 60 * 24 * 30
    wechat_app_id: str = ""
    wechat_app_secret: str = ""
    sms_dev_code: str = "123456"

    model_config = SettingsConfigDict(env_file=ENV_FILE, env_file_encoding="utf-8")

    @property
    def sqlalchemy_database_url(self) -> str:
        if self.database_url:
            return self.database_url

        user = quote_plus(self.mysql_user)
        password = quote_plus(self.mysql_password)
        return (
            f"{self.database_driver}://{user}:{password}"
            f"@{self.mysql_host}:{self.mysql_port}/{self.mysql_database}"
        )


settings = Settings()
