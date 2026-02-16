from pydantic import BaseModel, EmailStr, validator, Field
from typing import Optional
from datetime import datetime
from app.models.usuario import TipoUsuario, TipoDocumento

# Schema para registro de ESTUDIANTE
class EstudianteRegistro(BaseModel):
    nombres: str = Field(..., min_length=2, max_length=100)
    apellidos: str = Field(..., min_length=2, max_length=100)
    tipo_documento: TipoDocumento
    numero_documento: str = Field(..., min_length=6, max_length=20)
    correo_institucional: EmailStr
    password: str = Field(..., min_length=8)
    programa: str
    promocion: str  # Formato: 2024-1
    
    @validator('correo_institucional')
    def validar_correo_estudiante(cls, v):
        if not v.endswith('@estudiantes.uniempresarial.edu.co'):
            raise ValueError('Debes usar tu correo institucional de estudiante')
        return v.lower()
    
    @validator('promocion')
    def validar_promocion(cls, v):
        # Formato esperado: YYYY-1 o YYYY-2
        import re
        if not re.match(r'^\d{4}-[12]$', v):
            raise ValueError('Formato de promoción inválido. Use: YYYY-1 o YYYY-2')
        return v
    
    @validator('password')
    def validar_password(cls, v):
        if len(v) < 8:
            raise ValueError('La contraseña debe tener al menos 8 caracteres')
        if not any(c.isupper() for c in v):
            raise ValueError('La contraseña debe contener al menos una mayúscula')
        if not any(c.islower() for c in v):
            raise ValueError('La contraseña debe contener al menos una minúscula')
        if not any(c.isdigit() for c in v):
            raise ValueError('La contraseña debe contener al menos un número')
        return v

# Schema para registro de PERSONAL
class PersonalRegistro(BaseModel):
    nombres: str = Field(..., min_length=2, max_length=100)
    apellidos: str = Field(..., min_length=2, max_length=100)
    tipo_documento: TipoDocumento
    numero_documento: str = Field(..., min_length=6, max_length=20)
    correo_institucional: EmailStr
    password: str = Field(..., min_length=8)
    cargo: str
    
    @validator('correo_institucional')
    def validar_correo_personal(cls, v):
        if not v.endswith('@uniempresarial.edu.co'):
            raise ValueError('Debes usar tu correo institucional')
        if v.endswith('@estudiantes.uniempresarial.edu.co'):
            raise ValueError('Este correo es de estudiante. Usa el registro de estudiantes.')
        return v.lower()
    
    @validator('password')
    def validar_password(cls, v):
        if len(v) < 8:
            raise ValueError('La contraseña debe tener al menos 8 caracteres')
        if not any(c.isupper() for c in v):
            raise ValueError('La contraseña debe contener al menos una mayúscula')
        if not any(c.islower() for c in v):
            raise ValueError('La contraseña debe contener al menos una minúscula')
        if not any(c.isdigit() for c in v):
            raise ValueError('La contraseña debe contener al menos un número')
        return v

# Schema de respuesta
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
