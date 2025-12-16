from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    database_url: str = Field(default="sqlite:///./data/app.db")
    model: str = Field(default="gemma3:12b")
    ollama_host: str = Field(default="http://127.0.0.1:11434")

    class Config:
        env_file = ".env"


settings = Settings()

