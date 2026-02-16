from pydantic_settings import BaseSettings
from typing import List, Union
from pydantic import field_validator, model_validator
import json
import os

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql://user:password@localhost:5432/bienestar_who5"
    
    # JWT
    SECRET_KEY: str = "change-this-secret-key-in-production-please"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 horas
    
    # CORS - Se parseará desde string a lista
    # Usamos Union para permitir tanto string como lista durante la validación
    ALLOWED_ORIGINS: Union[str, List[str]] = "http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:5174,http://127.0.0.1:5175"
    
    @field_validator('ALLOWED_ORIGINS', mode='before')
    @classmethod
    def parse_cors_origins(cls, v):
        # Si ya es una lista, retornarla
        if isinstance(v, list):
            return v
        
        # Si es string, parsearlo
        if isinstance(v, str):
            # Si viene como JSON string del .env
            v_stripped = v.strip()
            if v_stripped.startswith('[') and v_stripped.endswith(']'):
                try:
                    parsed = json.loads(v_stripped)
                    if isinstance(parsed, list):
                        return parsed
                except (json.JSONDecodeError, ValueError):
                    pass
            # Si viene como lista separada por comas
            origins = [origin.strip() for origin in v.split(',') if origin.strip()]
            return origins if origins else ["http://localhost:5173"]
        
        # Fallback por defecto
        return ["http://localhost:5173"]
    
    @model_validator(mode='after')
    def ensure_list_type(self):
        """Asegurar que ALLOWED_ORIGINS siempre sea una lista después de la validación"""
        if isinstance(self.ALLOWED_ORIGINS, str):
            if self.ALLOWED_ORIGINS.strip().startswith('['):
                try:
                    self.ALLOWED_ORIGINS = json.loads(self.ALLOWED_ORIGINS)
                except:
                    self.ALLOWED_ORIGINS = [origin.strip() for origin in self.ALLOWED_ORIGINS.split(',') if origin.strip()]
            else:
                self.ALLOWED_ORIGINS = [origin.strip() for origin in self.ALLOWED_ORIGINS.split(',') if origin.strip()]
        return self
    
    def get_allowed_origins(self) -> List[str]:
        """Método helper para obtener los orígenes como lista"""
        if isinstance(self.ALLOWED_ORIGINS, list):
            return self.ALLOWED_ORIGINS
        elif isinstance(self.ALLOWED_ORIGINS, str):
            if self.ALLOWED_ORIGINS.strip().startswith('['):
                try:
                    return json.loads(self.ALLOWED_ORIGINS)
                except:
                    return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(',') if origin.strip()]
            return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(',') if origin.strip()]
        return ["http://localhost:5173"]
    
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
