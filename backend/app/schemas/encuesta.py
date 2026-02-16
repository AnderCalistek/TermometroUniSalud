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
