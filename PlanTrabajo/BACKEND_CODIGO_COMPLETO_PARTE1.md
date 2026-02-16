# 🔧 CÓDIGO COMPLETO BACKEND - FastAPI
## Sistema de Bienestar WHO-5

---

## 📁 ESTRUCTURA DE ARCHIVOS

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── config/
│   │   ├── __init__.py
│   │   ├── settings.py
│   │   └── database.py
│   ├── models/
│   │   ├── __init__.py
│   │   ├── usuario.py
│   │   ├── encuesta.py
│   │   ├── respuesta.py
│   │   └── alerta.py
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── usuario.py
│   │   ├── encuesta.py
│   │   └── auth.py
│   ├── services/
│   │   ├── __init__.py
│   │   ├── auth_service.py
│   │   ├── who5_service.py
│   │   ├── export_service.py
│   │   └── alert_service.py
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── encuestas.py
│   │   ├── dashboard.py
│   │   └── usuarios.py
│   └── utils/
│       ├── __init__.py
│       ├── security.py
│       └── validators.py
├── migrations/
├── tests/
├── requirements.txt
└── .env.example
```

---

## 📄 ARCHIVO 1: `app/config/settings.py`

```python
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
```

---

## 📄 ARCHIVO 2: `app/config/database.py`

```python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config.settings import settings

# Crear engine
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    echo=settings.DEBUG
)

# Session maker
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base para modelos
Base = declarative_base()

# Dependency para FastAPI
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

---

## 📄 ARCHIVO 3: `app/models/usuario.py`

```python
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum as SQLEnum, CheckConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.config.database import Base

class TipoUsuario(str, enum.Enum):
    ESTUDIANTE = "estudiante"
    PERSONAL = "personal"
    ADMIN = "admin"
    PSICOLOGO = "psicologo"

class TipoDocumento(str, enum.Enum):
    CC = "CC"
    TI = "TI"

class Rol(str, enum.Enum):
    USER = "user"
    ADMIN = "admin"
    PSICOLOGO = "psicologo"
    ANALISTA = "analista"

class Usuario(Base):
    __tablename__ = "usuarios"
    
    # Identificación
    id = Column(Integer, primary_key=True, index=True)
    tipo_usuario = Column(SQLEnum(TipoUsuario), nullable=False)
    nombres = Column(String(100), nullable=False)
    apellidos = Column(String(100), nullable=False)
    tipo_documento = Column(SQLEnum(TipoDocumento), nullable=False)
    numero_documento = Column(String(20), unique=True, nullable=False, index=True)
    correo_institucional = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    rol = Column(SQLEnum(Rol), default=Rol.USER)
    
    # Campos específicos ESTUDIANTE
    programa = Column(String(100), nullable=True)
    promocion = Column(String(10), nullable=True)  # Formato: 2024-1
    
    # Campos específicos PERSONAL
    cargo = Column(String(100), nullable=True)
    
    # Consentimiento
    consent_accepted = Column(Boolean, default=False)
    consent_date = Column(DateTime, nullable=True)
    can_contact = Column(Boolean, default=False)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True)
    
    # Relaciones
    encuestas = relationship("Encuesta", back_populates="usuario", cascade="all, delete-orphan")
    alertas = relationship("Alerta", back_populates="usuario", foreign_keys="Alerta.usuario_id")
    
    # Constraints
    __table_args__ = (
        CheckConstraint(
            "correo_institucional LIKE '%@uniempresarial.edu.co' OR "
            "correo_institucional LIKE '%@estudiantes.uniempresarial.edu.co'",
            name="check_email_institucional"
        ),
    )
    
    def __repr__(self):
        return f"<Usuario {self.correo_institucional}>"
```

---

## 📄 ARCHIVO 4: `app/models/encuesta.py`

```python
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, CheckConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
from app.config.database import Base

class Encuesta(Base):
    __tablename__ = "encuestas"
    
    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    
    # Resultados WHO-5
    puntaje_raw = Column(Integer, nullable=True)  # 0-25
    puntaje_final = Column(Integer, nullable=True)  # 0-100
    es_alerta = Column(Boolean, default=False, index=True)  # TRUE si < 13
    
    # Comentarios opcionales
    comentario = Column(Text, nullable=True)
    
    # Estado
    estado = Column(String(20), default="completada")
    
    # Relaciones
    usuario = relationship("Usuario", back_populates="encuestas")
    respuestas = relationship("Respuesta", back_populates="encuesta", cascade="all, delete-orphan")
    alerta = relationship("Alerta", back_populates="encuesta", uselist=False, cascade="all, delete-orphan")
    
    # Constraints
    __table_args__ = (
        CheckConstraint("puntaje_raw >= 0 AND puntaje_raw <= 25", name="check_puntaje_raw"),
        CheckConstraint("puntaje_final >= 0 AND puntaje_final <= 100", name="check_puntaje_final"),
        CheckConstraint("estado IN ('completada', 'en_revision')", name="check_estado"),
    )
    
    def __repr__(self):
        return f"<Encuesta {self.id} - Usuario {self.usuario_id}>"
```

---

## 📄 ARCHIVO 5: `app/models/respuesta.py`

```python
from sqlalchemy import Column, Integer, ForeignKey, CheckConstraint, UniqueConstraint
from sqlalchemy.orm import relationship
from app.config.database import Base

class Respuesta(Base):
    __tablename__ = "respuestas"
    
    id = Column(Integer, primary_key=True, index=True)
    encuesta_id = Column(Integer, ForeignKey("encuestas.id", ondelete="CASCADE"), nullable=False, index=True)
    pregunta_numero = Column(Integer, nullable=False)  # 1-5
    valor = Column(Integer, nullable=False)  # 0-5
    
    # Relaciones
    encuesta = relationship("Encuesta", back_populates="respuestas")
    
    # Constraints
    __table_args__ = (
        CheckConstraint("pregunta_numero >= 1 AND pregunta_numero <= 5", name="check_pregunta_numero"),
        CheckConstraint("valor >= 0 AND valor <= 5", name="check_valor"),
        UniqueConstraint("encuesta_id", "pregunta_numero", name="unique_encuesta_pregunta"),
    )
    
    def __repr__(self):
        return f"<Respuesta Encuesta {self.encuesta_id} - P{self.pregunta_numero}: {self.valor}>"
```

---

## 📄 ARCHIVO 6: `app/models/alerta.py`

```python
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, CheckConstraint, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
from app.config.database import Base

class Alerta(Base):
    __tablename__ = "alertas"
    
    id = Column(Integer, primary_key=True, index=True)
    encuesta_id = Column(Integer, ForeignKey("encuestas.id", ondelete="CASCADE"), nullable=False, unique=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False, index=True)
    
    # Metadata de la alerta
    puntaje_obtenido = Column(Integer, nullable=False)
    prioridad = Column(String(10), default="media")  # alta, media
    
    # Estado
    estado = Column(String(20), default="pendiente", index=True)  # pendiente, en_atencion, resuelta
    
    # Atención
    atendida_por = Column(Integer, ForeignKey("usuarios.id"), nullable=True)
    fecha_atencion = Column(DateTime, nullable=True)
    accion_tomada = Column(Text, nullable=True)
    notas_psicologo = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    # Relaciones
    encuesta = relationship("Encuesta", back_populates="alerta")
    usuario = relationship("Usuario", back_populates="alertas", foreign_keys=[usuario_id])
    psicologo = relationship("Usuario", foreign_keys=[atendida_por])
    
    # Constraints
    __table_args__ = (
        CheckConstraint("prioridad IN ('alta', 'media')", name="check_prioridad"),
        CheckConstraint("estado IN ('pendiente', 'en_atencion', 'resuelta')", name="check_estado"),
    )
    
    def __repr__(self):
        return f"<Alerta {self.id} - Usuario {self.usuario_id} - Estado {self.estado}>"
```

---

## 📄 ARCHIVO 7: `app/schemas/usuario.py`

```python
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
```

---

## 📄 ARCHIVO 8: `app/schemas/encuesta.py`

```python
from pydantic import BaseModel, Field, validator
from typing import List, Optional
from datetime import datetime

class RespuestaWHO5(BaseModel):
    pregunta_numero: int = Field(..., ge=1, le=5)
    valor: int = Field(..., ge=0, le=5)

class EncuestaCreate(BaseModel):
    respuestas: List[RespuestaWHO5] = Field(..., min_items=5, max_items=5)
    comentario: Optional[str] = None
    can_contact: bool = False
    
    @validator('respuestas')
    def validar_respuestas_completas(cls, v):
        # Verificar que hay exactamente 5 respuestas
        if len(v) != 5:
            raise ValueError('Debes responder las 5 preguntas')
        
        # Verificar que no hay preguntas repetidas
        numeros = [r.pregunta_numero for r in v]
        if len(set(numeros)) != 5:
            raise ValueError('No puedes responder la misma pregunta dos veces')
        
        # Verificar que están las preguntas 1-5
        if set(numeros) != {1, 2, 3, 4, 5}:
            raise ValueError('Deben estar todas las preguntas del 1 al 5')
        
        return v

class EncuestaResponse(BaseModel):
    id: int
    usuario_id: int
    created_at: datetime
    completed_at: Optional[datetime]
    puntaje_raw: Optional[int]
    puntaje_final: Optional[int]
    es_alerta: bool
    comentario: Optional[str]
    estado: str
    
    class Config:
        from_attributes = True

class EncuestaDetalle(EncuestaResponse):
    respuestas: List[RespuestaWHO5]
    usuario_nombres: str
    usuario_apellidos: str
    usuario_programa: Optional[str]
    usuario_cargo: Optional[str]
```

---

## 📄 ARCHIVO 9: `app/services/who5_service.py`

```python
from app.config.settings import settings
from typing import List

class WHO5Service:
    """
    Servicio para cálculo de puntaje WHO-5
    
    Fórmula: Puntaje Final = (Suma de respuestas) × 4
    Rango: 0-100
    Alerta: < 13
    """
    
    @staticmethod
    def calcular_puntaje_raw(respuestas: List[int]) -> int:
        """
        Calcula el puntaje crudo (0-25)
        
        Args:
            respuestas: Lista de 5 valores (0-5)
        
        Returns:
            Suma de los valores
        """
        if len(respuestas) != 5:
            raise ValueError("Deben ser exactamente 5 respuestas")
        
        if not all(0 <= r <= 5 for r in respuestas):
            raise ValueError("Todas las respuestas deben estar entre 0 y 5")
        
        return sum(respuestas)
    
    @staticmethod
    def calcular_puntaje_final(puntaje_raw: int) -> int:
        """
        Calcula el puntaje final (0-100)
        
        Args:
            puntaje_raw: Puntaje crudo (0-25)
        
        Returns:
            Puntaje final = puntaje_raw × 4
        """
        if not 0 <= puntaje_raw <= 25:
            raise ValueError("El puntaje raw debe estar entre 0 y 25")
        
        return puntaje_raw * 4
    
    @staticmethod
    def es_alerta(puntaje_final: int) -> bool:
        """
        Determina si el puntaje indica alerta
        
        Args:
            puntaje_final: Puntaje final (0-100)
        
        Returns:
            True si puntaje < 13 (umbral de alerta)
        """
        return puntaje_final < settings.WHO5_UMBRAL_ALERTA
    
    @staticmethod
    def clasificar_bienestar(puntaje_final: int) -> dict:
        """
        Clasifica el nivel de bienestar
        
        Args:
            puntaje_final: Puntaje final (0-100)
        
        Returns:
            Dict con nivel, color y mensaje
        """
        if puntaje_final < 13:
            return {
                "nivel": "Bajo bienestar",
                "categoria": "alerta",
                "color": "#E53E3E",
                "mensaje": "Tu nivel de bienestar puede requerir atención. Te invitamos a contactar al área de Bienestar Universitario."
            }
        elif puntaje_final < 51:
            return {
                "nivel": "Bienestar moderado",
                "categoria": "bajo",
                "color": "#D69E2E",
                "mensaje": "Tu nivel de bienestar es moderado. Considera explorar recursos de apoyo disponibles."
            }
        elif puntaje_final < 76:
            return {
                "nivel": "Buen bienestar",
                "categoria": "medio",
                "color": "#4A90E2",
                "mensaje": "Tu nivel de bienestar es bueno. Continúa cuidando tu salud emocional."
            }
        else:
            return {
                "nivel": "Excelente bienestar",
                "categoria": "alto",
                "color": "#38A169",
                "mensaje": "Tu nivel de bienestar es excelente. ¡Sigue así!"
            }
    
    @staticmethod
    def hay_cambio_significativo(puntaje_anterior: int, puntaje_actual: int) -> bool:
        """
        Determina si hay cambio significativo entre dos mediciones
        
        Args:
            puntaje_anterior: Puntaje de medición anterior
            puntaje_actual: Puntaje de medición actual
        
        Returns:
            True si diferencia absoluta >= 10 puntos
        """
        diferencia = abs(puntaje_actual - puntaje_anterior)
        return diferencia >= settings.WHO5_CAMBIO_SIGNIFICATIVO
    
    @staticmethod
    def obtener_preguntas_who5() -> List[dict]:
        """
        Retorna las 5 preguntas oficiales del WHO-5 en español
        
        Returns:
            Lista de diccionarios con las preguntas
        """
        return [
            {
                "numero": 1,
                "texto": "Me he sentido alegre y de buen humor",
                "opciones": [
                    {"valor": 5, "label": "Todo el tiempo"},
                    {"valor": 4, "label": "La mayor parte del tiempo"},
                    {"valor": 3, "label": "Más de la mitad del tiempo"},
                    {"valor": 2, "label": "Menos de la mitad del tiempo"},
                    {"valor": 1, "label": "De vez en cuando"},
                    {"valor": 0, "label": "Nunca"}
                ]
            },
            {
                "numero": 2,
                "texto": "Me he sentido tranquilo y relajado",
                "opciones": [
                    {"valor": 5, "label": "Todo el tiempo"},
                    {"valor": 4, "label": "La mayor parte del tiempo"},
                    {"valor": 3, "label": "Más de la mitad del tiempo"},
                    {"valor": 2, "label": "Menos de la mitad del tiempo"},
                    {"valor": 1, "label": "De vez en cuando"},
                    {"valor": 0, "label": "Nunca"}
                ]
            },
            {
                "numero": 3,
                "texto": "Me he sentido activo y enérgico",
                "opciones": [
                    {"valor": 5, "label": "Todo el tiempo"},
                    {"valor": 4, "label": "La mayor parte del tiempo"},
                    {"valor": 3, "label": "Más de la mitad del tiempo"},
                    {"valor": 2, "label": "Menos de la mitad del tiempo"},
                    {"valor": 1, "label": "De vez en cuando"},
                    {"valor": 0, "label": "Nunca"}
                ]
            },
            {
                "numero": 4,
                "texto": "Me he despertado fresco y descansado",
                "opciones": [
                    {"valor": 5, "label": "Todo el tiempo"},
                    {"valor": 4, "label": "La mayor parte del tiempo"},
                    {"valor": 3, "label": "Más de la mitad del tiempo"},
                    {"valor": 2, "label": "Menos de la mitad del tiempo"},
                    {"valor": 1, "label": "De vez en cuando"},
                    {"valor": 0, "label": "Nunca"}
                ]
            },
            {
                "numero": 5,
                "texto": "Mi vida cotidiana ha estado llena de cosas que me interesan",
                "opciones": [
                    {"valor": 5, "label": "Todo el tiempo"},
                    {"valor": 4, "label": "La mayor parte del tiempo"},
                    {"valor": 3, "label": "Más de la mitad del tiempo"},
                    {"valor": 2, "label": "Menos de la mitad del tiempo"},
                    {"valor": 1, "label": "De vez en cuando"},
                    {"valor": 0, "label": "Nunca"}
                ]
            }
        ]
```

---

**CONTINÚA EN EL SIGUIENTE ARCHIVO (parte 2 del backend)...**
