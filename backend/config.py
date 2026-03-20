from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    mongodb_url: str = "mongodb://127.0.0.1:27017"
    database_name: str = "inventory_db"

    class Config:
        env_file = ".env"


settings = Settings()
