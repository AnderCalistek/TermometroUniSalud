from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional
from datetime import datetime
from app.models.usuario import TipoUsuario, TipoDocumento
import re


# ==============================
# Schema para registro ESTUDIANTE
# ==============================
class EstudianteRegistro(BaseModel):
    nombres: str = Field(..., min_length=2, max_length=100)
    apellidos: str = Field(..., min_length=2, max_length=100)
    tipo_documento: TipoDocumento
    numero_documento: str = Field(..., min_length=6, max_length=20)
    correo_institucional: EmailStr
    password: str = Field(..., min_length=8, max_length=72)
    programa: str
    promocion: str  # Formato: YYYY-1 o YYYY-2

    @field_validator('correo_institucional')
    @classmethod
    def validar_correo_estudiante(cls, v: str) -> str:
        if not v.endswith('@estudiantes.uniempresarial.edu.co'):
            raise ValueError(
                'Debes usar tu correo institucional de estudiante'
            )
        return v.lower()

    @field_validator('promocion')
    @classmethod
    def validar_promocion(cls, v: str) -> str:
        if not re.match(r'^\d{4}-[12]$', v):
            raise ValueError(
                'Formato de promoción inválido. Use: YYYY-1 o YYYY-2'
            )
        return v

    @field_validator('password')
    @classmethod
    def validar_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError(
                'La contraseña debe tener al menos 8 caracteres'
            )
        if not any(c.isupper() for c in v):
            raise ValueError(
                'La contraseña debe contener al menos una mayúscula'
            )
        if not any(c.islower() for c in v):
            raise ValueError(
                'La contraseña debe contener al menos una minúscula'
            )
        if not any(c.isdigit() for c in v):
            raise ValueError(
                'La contraseña debe contener al menos un número'
            )
        return v


# ==============================
# Schema para registro PERSONAL
# ==============================
class PersonalRegistro(BaseModel):
    nombres: str = Field(..., min_length=2, max_length=100)
    apellidos: str = Field(..., min_length=2, max_length=100)
    tipo_documento: TipoDocumento
    numero_documento: str = Field(..., min_length=6, max_length=20)
    correo_institucional: EmailStr
    password: str = Field(..., min_length=8, max_length=72)
    cargo: str

    @field_validator('correo_institucional')
    @classmethod
    def validar_correo_personal(cls, v: str) -> str:
        if not v.endswith('@uniempresarial.edu.co'):
            raise ValueError(
                'Debes usar tu correo institucional'
            )
        if v.endswith('@estudiantes.uniempresarial.edu.co'):
            raise ValueError(
                'Este correo es de estudiante. Usa el registro de estudiantes.'
            )
        return v.lower()

    @field_validator('password')
    @classmethod
    def validar_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError(
                'La contraseña debe tener al menos 8 caracteres'
            )
        if not any(c.isupper() for c in v):
            raise ValueError(
                'La contraseña debe contener al menos una mayúscula'
            )
        if not any(c.islower() for c in v):
            raise ValueError(
                'La contraseña debe contener al menos una minúscula'
            )
        if not any(c.isdigit() for c in v):
            raise ValueError(
                'La contraseña debe contener al menos un número'
            )
        return v


# ==============================
# Schema de respuesta
# ==============================
class UsuarioResponse(BaseModel):
    id: int
    tipo_usuario: TipoUsuario
    nombres: str
    apellidos: str
    tipo_documento: TipoDocumento
    numero_documento: str
    correo_institucional: str
    rol: str
    programa: Optional[str]
    promocion: Optional[str]
    cargo: Optional[str]
    consent_accepted: bool
    consent_date: Optional[datetime]
    can_contact: bool
    created_at: datetime
    last_login: Optional[datetime]

    class Config:
        from_attributes = True
