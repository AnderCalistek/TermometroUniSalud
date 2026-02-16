from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List
from app.config.database import get_db
from app.models.usuario import Usuario
from app.models.encuesta import Encuesta
from app.models.respuesta import Respuesta
from app.models.alerta import Alerta
from app.schemas.encuesta import EncuestaCreate, EncuestaResponse
from app.services.who5_service import WHO5Service
from app.utils.security import get_current_user

router = APIRouter()

@router.post("/consentimiento")
def aceptar_consentimiento(
    can_contact: bool = Query(False),
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Registra el consentimiento informado del usuario"""
    
    current_user.consent_accepted = True
    current_user.consent_date = datetime.utcnow()
    current_user.can_contact = can_contact
    
    db.commit()
    
    return {
        "message": "Consentimiento registrado exitosamente",
        "consent_date": current_user.consent_date
    }

@router.post("/", response_model=EncuestaResponse, status_code=status.HTTP_201_CREATED)
def crear_encuesta(
    data: EncuestaCreate,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Crea y completa una nueva encuesta WHO-5
    """
    
    # Verificar consentimiento
    if not current_user.consent_accepted:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Debes aceptar el consentimiento informado primero"
        )
    
    # Extraer valores de respuestas
    valores = [r.valor for r in sorted(data.respuestas, key=lambda x: x.pregunta_numero)]
    
    # Calcular puntajes
    puntaje_raw = WHO5Service.calcular_puntaje_raw(valores)
    puntaje_final = WHO5Service.calcular_puntaje_final(puntaje_raw)
    es_alerta = WHO5Service.es_alerta(puntaje_final)
    
    # Crear encuesta
    encuesta = Encuesta(
        usuario_id=current_user.id,
        completed_at=datetime.utcnow(),
        puntaje_raw=puntaje_raw,
        puntaje_final=puntaje_final,
        es_alerta=es_alerta,
        comentario=data.comentario,
        estado="completada"
    )
    
    db.add(encuesta)
    db.flush()  # Para obtener el ID
    
    # Guardar respuestas
    for respuesta_data in data.respuestas:
        respuesta = Respuesta(
            encuesta_id=encuesta.id,
            pregunta_numero=respuesta_data.pregunta_numero,
            valor=respuesta_data.valor
        )
        db.add(respuesta)
    
    # Crear alerta si es necesario
    if es_alerta:
        alerta = Alerta(
            encuesta_id=encuesta.id,
            usuario_id=current_user.id,
            puntaje_obtenido=puntaje_final,
            prioridad="alta" if puntaje_final < 10 else "media",
            estado="pendiente"
        )
        db.add(alerta)
    
    db.commit()
    db.refresh(encuesta)
    
    return encuesta

@router.get("/preguntas")
def obtener_preguntas():
    """Obtiene las 5 preguntas del WHO-5"""
    return {
        "instrumento": "WHO-5",
        "periodo": "Últimas 2 semanas",
        "preguntas": WHO5Service.obtener_preguntas_who5()
    }

@router.get("/mis-encuestas", response_model=List[EncuestaResponse])
def obtener_mis_encuestas(
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Obtiene el historial de encuestas del usuario actual"""
    
    encuestas = db.query(Encuesta).filter(
        Encuesta.usuario_id == current_user.id
    ).order_by(Encuesta.created_at.desc()).all()
    
    return encuestas

@router.get("/{encuesta_id}/resultado")
def obtener_resultado(
    encuesta_id: int,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Obtiene el resultado detallado de una encuesta"""
    
    encuesta = db.query(Encuesta).filter(
        Encuesta.id == encuesta_id,
        Encuesta.usuario_id == current_user.id
    ).first()
    
    if not encuesta:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Encuesta no encontrada"
        )
    
    # Clasificación de bienestar
    clasificacion = WHO5Service.clasificar_bienestar(encuesta.puntaje_final)
    
    # Verificar cambio significativo si hay encuesta anterior
    encuesta_anterior = db.query(Encuesta).filter(
        Encuesta.usuario_id == current_user.id,
        Encuesta.id < encuesta_id,
        Encuesta.completed_at.isnot(None)
    ).order_by(Encuesta.created_at.desc()).first()
    
    cambio_significativo = None
    if encuesta_anterior:
        tiene_cambio = WHO5Service.hay_cambio_significativo(
            encuesta_anterior.puntaje_final,
            encuesta.puntaje_final
        )
        if tiene_cambio:
            diferencia = encuesta.puntaje_final - encuesta_anterior.puntaje_final
            cambio_significativo = {
                "hay_cambio": True,
                "diferencia": diferencia,
                "tipo": "mejora" if diferencia > 0 else "empeoramiento",
                "puntaje_anterior": encuesta_anterior.puntaje_final
            }
    
    return {
        "encuesta_id": encuesta.id,
        "fecha": encuesta.completed_at,
        "puntaje_raw": encuesta.puntaje_raw,
        "puntaje_final": encuesta.puntaje_final,
        "clasificacion": clasificacion,
        "es_alerta": encuesta.es_alerta,
        "cambio_significativo": cambio_significativo,
        "comentario": encuesta.comentario
    }
