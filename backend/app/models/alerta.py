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
