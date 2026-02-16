from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func, case, and_
from datetime import datetime, timedelta
from typing import Optional
from app.config.database import get_db
from app.models.usuario import Usuario
from app.models.encuesta import Encuesta
from app.models.alerta import Alerta
from app.services.export_service import ExportService
from app.utils.security import require_role

router = APIRouter()

@router.get("/metricas")
def obtener_metricas(
    periodo: str = "30d",
    tipo_usuario: Optional[str] = None,
    programa: Optional[str] = None,
    current_user: Usuario = Depends(require_role(["admin", "psicologo", "analista"])),
    db: Session = Depends(get_db)
):
    """
    Obtiene métricas del dashboard
    
    Parámetros:
    - periodo: 7d, 30d, 90d, all
    - tipo_usuario: estudiante, personal (opcional)
    - programa: Filtrar por programa (opcional)
    """
    
    # Calcular fecha de corte según período
    if periodo == "7d":
        fecha_desde = datetime.utcnow() - timedelta(days=7)
    elif periodo == "30d":
        fecha_desde = datetime.utcnow() - timedelta(days=30)
    elif periodo == "90d":
        fecha_desde = datetime.utcnow() - timedelta(days=90)
    else:
        fecha_desde = None
    
    # Base query
    query_usuarios = db.query(Usuario)
    query_encuestas = db.query(Encuesta)
    
    # Aplicar filtros
    if tipo_usuario:
        query_usuarios = query_usuarios.filter(Usuario.tipo_usuario == tipo_usuario)
        query_encuestas = query_encuestas.join(Usuario).filter(Usuario.tipo_usuario == tipo_usuario)
    
    if programa:
        query_usuarios = query_usuarios.filter(Usuario.programa == programa)
        query_encuestas = query_encuestas.join(Usuario).filter(Usuario.programa == programa)
    
    if fecha_desde:
        query_encuestas = query_encuestas.filter(Encuesta.created_at >= fecha_desde)
    
    # Métricas
    total_usuarios = query_usuarios.count()
    total_encuestas = query_encuestas.count()
    
    # Tasa de participación
    usuarios_han_respondido = query_usuarios.join(Encuesta).distinct().count()
    tasa_participacion = (usuarios_han_respondido / total_usuarios * 100) if total_usuarios > 0 else 0
    
    # Puntaje promedio
    puntaje_promedio = db.query(func.avg(Encuesta.puntaje_final)).filter(
        Encuesta.completed_at.isnot(None)
    ).scalar() or 0
    
    # Alertas
    alertas_activas = db.query(Alerta).filter(Alerta.estado != "resuelta").count()
    alertas_pendientes = db.query(Alerta).filter(Alerta.estado == "pendiente").count()
    alertas_resueltas = db.query(Alerta).filter(Alerta.estado == "resuelta").count()
    
    # Distribución de puntajes
    distribucion = db.query(
        func.sum(case((Encuesta.puntaje_final < 13, 1), else_=0)).label("alerta"),
        func.sum(case((and_(Encuesta.puntaje_final >= 13, Encuesta.puntaje_final < 51), 1), else_=0)).label("bajo"),
        func.sum(case((and_(Encuesta.puntaje_final >= 51, Encuesta.puntaje_final < 76), 1), else_=0)).label("medio"),
        func.sum(case((Encuesta.puntaje_final >= 76, 1), else_=0)).label("alto")
    ).filter(Encuesta.completed_at.isnot(None)).first()
    
    return {
        "total_usuarios": total_usuarios,
        "total_encuestas": total_encuestas,
        "tasa_participacion": round(tasa_participacion, 2),
        "puntaje_promedio": round(puntaje_promedio, 2),
        "alertas": {
            "activas": alertas_activas,
            "pendientes": alertas_pendientes,
            "resueltas": alertas_resueltas
        },
        "distribucion_puntajes": {
            "alerta_0_12": distribucion.alerta or 0,
            "bajo_13_50": distribucion.bajo or 0,
            "medio_51_75": distribucion.medio or 0,
            "alto_76_100": distribucion.alto or 0
        }
    }

@router.get("/alertas")
def listar_alertas(
    estado: str = "all",
    current_user: Usuario = Depends(require_role(["admin", "psicologo"])),
    db: Session = Depends(get_db)
):
    """Lista las alertas del sistema"""
    
    query = db.query(Alerta).join(Encuesta).join(Usuario)
    
    if estado != "all":
        query = query.filter(Alerta.estado == estado)
    
    alertas = query.order_by(Alerta.created_at.desc()).limit(100).all()
    
    resultado = []
    for alerta in alertas:
        usuario = alerta.usuario
        resultado.append({
            "id": alerta.id,
            "encuesta_id": alerta.encuesta_id,
            "puntaje": alerta.puntaje_obtenido,
            "prioridad": alerta.prioridad,
            "estado": alerta.estado,
            "usuario": {
                "id": usuario.id,
                "nombres": usuario.nombres,
                "apellidos": usuario.apellidos,
                "tipo_documento": usuario.tipo_documento,
                "numero_documento": f"****{usuario.numero_documento[-4:]}",  # Últimos 4 dígitos
                "tipo_usuario": usuario.tipo_usuario,
                "programa": usuario.programa,
                "cargo": usuario.cargo
            },
            "fecha_alerta": alerta.created_at,
            "atendida_por": alerta.atendida_por,
            "fecha_atencion": alerta.fecha_atencion,
            "accion_tomada": alerta.accion_tomada
        })
    
    return resultado

@router.patch("/alertas/{alerta_id}/resolver")
def resolver_alerta(
    alerta_id: int,
    accion_tomada: str,
    notas: Optional[str] = None,
    current_user: Usuario = Depends(require_role(["admin", "psicologo"])),
    db: Session = Depends(get_db)
):
    """Marca una alerta como resuelta"""
    
    alerta = db.query(Alerta).filter(Alerta.id == alerta_id).first()
    
    if not alerta:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alerta no encontrada"
        )
    
    alerta.estado = "resuelta"
    alerta.atendida_por = current_user.id
    alerta.fecha_atencion = datetime.utcnow()
    alerta.accion_tomada = accion_tomada
    alerta.notas_psicologo = notas
    
    db.commit()
    
    return {"message": "Alerta resuelta exitosamente"}

@router.get("/export/excel")
def exportar_excel(
    tipo_usuario: Optional[str] = None,
    programa: Optional[str] = None,
    es_alerta: Optional[bool] = None,
    current_user: Usuario = Depends(require_role(["admin", "psicologo"])),
    db: Session = Depends(get_db)
):
    """Exporta encuestas a Excel"""
    
    filtros = {}
    if tipo_usuario:
        filtros['tipo_usuario'] = tipo_usuario
    if programa:
        filtros['programa'] = programa
    if es_alerta is not None:
        filtros['es_alerta'] = es_alerta
    
    # Generar Excel
    excel_bytes = ExportService.export_to_excel(db, filtros)
    
    # Crear nombre de archivo
    filename = f"reporte_bienestar_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
    
    return StreamingResponse(
        iter([excel_bytes]),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
