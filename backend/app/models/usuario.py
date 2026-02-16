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
