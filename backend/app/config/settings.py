from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql://user:password@localhost:5432/bienestar_who5"
    
    # JWT
    SECRET_KEY: str = "change-this-secret-key-in-production-please"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 horas
    
    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000"
    ]
    
    # Universidad
    UNIVERSIDAD_NOMBRE: str = "Uniempresarial"
    DOMINIO_ESTUDIANTES: str = "@estudiantes.uniempresarial.edu.co"
    DOMINIO_PERSONAL: str = "@uniempresarial.edu.co"
    
    # WHO-5 Configuration
    WHO5_UMBRAL_ALERTA: int = 13
    WHO5_CAMBIO_SIGNIFICATIVO: int = 10
    WHO5_PUNTAJE_MINIMO: int = 0
    WHO5_PUNTAJE_MAXIMO: int = 100
    
    # Email (opcional - para notificaciones)
    SMTP_SERVER: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_EMAIL: str = ""
    SMTP_PASSWORD: str = ""
    
    # App
    PROJECT_NAME: str = "Sistema de Bienestar Universitario - WHO-5"
    VERSION: str = "2.0.0"
    DEBUG: bool = True
    
    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings()
