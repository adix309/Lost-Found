from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    SMTP_HOST: str
    SMTP_PORT: int = 587
    SMTP_USERNAME: str
    SMTP_PASSWORD: str
    SMTP_FROM: str
    FRONTEND_URL: str = "http://localhost:3000"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()