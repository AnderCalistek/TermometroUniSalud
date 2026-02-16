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
