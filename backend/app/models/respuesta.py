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
