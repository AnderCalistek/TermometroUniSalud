# 🔧 CÓDIGO COMPLETO BACKEND - PARTE 2
## Rutas, Servicios y Main

---

## 📄 ARCHIVO 10: `app/services/auth_service.py`

```python
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.usuario import Usuario, TipoUsuario
from app.config.settings import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class AuthService:
    
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verifica que la contraseña coincida con el hash"""
        return pwd_context.verify(plain_password, hashed_password)
    
    @staticmethod
    def get_password_hash(password: str) -> str:
        """Genera hash de la contraseña"""
        return pwd_context.hash(password)
    
    @staticmethod
    def create_access_token(data: dict) -> str:
        """Crea JWT token"""
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
        return encoded_jwt
    
    @staticmethod
    def create_estudiante(db: Session, data: dict) -> Usuario:
        """Crea usuario tipo estudiante"""
        
        # Verificar si el correo ya existe
        if db.query(Usuario).filter(Usuario.correo_institucional == data['correo_institucional']).first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Este correo ya está registrado"
            )
        
        # Verificar si el documento ya existe
        if db.query(Usuario).filter(Usuario.numero_documento == data['numero_documento']).first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Este documento ya está registrado"
            )
        
        # Crear usuario
        usuario = Usuario(
            tipo_usuario=TipoUsuario.ESTUDIANTE,
            nombres=data['nombres'],
            apellidos=data['apellidos'],
            tipo_documento=data['tipo_documento'],
            numero_documento=data['numero_documento'],
            correo_institucional=data['correo_institucional'],
            password_hash=AuthService.get_password_hash(data['password']),
            programa=data['programa'],
            promocion=data['promocion'],
            rol="user"
        )
        
        db.add(usuario)
        db.commit()
        db.refresh(usuario)
        
        return usuario
    
    @staticmethod
    def create_personal(db: Session, data: dict) -> Usuario:
        """Crea usuario tipo personal"""
        
        # Verificar si el correo ya existe
        if db.query(Usuario).filter(Usuario.correo_institucional == data['correo_institucional']).first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Este correo ya está registrado"
            )
        
        # Verificar si el documento ya existe
        if db.query(Usuario).filter(Usuario.numero_documento == data['numero_documento']).first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Este documento ya está registrado"
            )
        
        # Crear usuario
        usuario = Usuario(
            tipo_usuario=TipoUsuario.PERSONAL,
            nombres=data['nombres'],
            apellidos=data['apellidos'],
            tipo_documento=data['tipo_documento'],
            numero_documento=data['numero_documento'],
            correo_institucional=data['correo_institucional'],
            password_hash=AuthService.get_password_hash(data['password']),
            cargo=data['cargo'],
            rol="user"
        )
        
        db.add(usuario)
        db.commit()
        db.refresh(usuario)
        
        return usuario
    
    @staticmethod
    def authenticate_user(db: Session, correo: str, password: str) -> Usuario:
        """Autentica usuario"""
        usuario = db.query(Usuario).filter(Usuario.correo_institucional == correo).first()
        
        if not usuario:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Correo o contraseña incorrectos"
            )
        
        if not AuthService.verify_password(password, usuario.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Correo o contraseña incorrectos"
            )
        
        if not usuario.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Usuario inactivo"
            )
        
        # Actualizar last_login
        usuario.last_login = datetime.utcnow()
        db.commit()
        
        return usuario
```

---

## 📄 ARCHIVO 11: `app/services/export_service.py`

```python
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.encuesta import Encuesta
from app.models.usuario import Usuario
from app.models.respuesta import Respuesta
from app.models.alerta import Alerta
import io

class ExportService:
    
    @staticmethod
    def export_to_excel(db: Session, filtros: dict = None) -> bytes:
        """
        Exporta encuestas a Excel
        
        Args:
            db: Sesión de base de datos
            filtros: Diccionario con filtros opcionales
        
        Returns:
            Bytes del archivo Excel
        """
        
        # Crear workbook
        wb = Workbook()
        ws = wb.active
        ws.title = "Encuestas Bienestar"
        
        # Estilos
        header_font = Font(bold=True, color="FFFFFF")
        header_fill = PatternFill(start_color="4A90E2", end_color="4A90E2", fill_type="solid")
        header_alignment = Alignment(horizontal="center", vertical="center")
        
        # Headers
        headers = [
            "ID Encuesta",
            "Fecha",
            "Tipo Usuario",
            "Documento",
            "Nombres",
            "Apellidos",
            "Programa/Cargo",
            "Promoción",
            "Pregunta 1",
            "Pregunta 2",
            "Pregunta 3",
            "Pregunta 4",
            "Pregunta 5",
            "Puntaje Raw",
            "Puntaje Final",
            "Es Alerta",
            "Estado Alerta",
            "Comentario"
        ]
        
        # Escribir headers
        for col, header in enumerate(headers, start=1):
            cell = ws.cell(row=1, column=col, value=header)
            cell.font = header_font
            cell.fill = header_fill
            cell.alignment = header_alignment
        
        # Query encuestas
        query = db.query(Encuesta).join(Usuario)
        
        # Aplicar filtros si existen
        if filtros:
            if filtros.get('tipo_usuario'):
                query = query.filter(Usuario.tipo_usuario == filtros['tipo_usuario'])
            if filtros.get('programa'):
                query = query.filter(Usuario.programa == filtros['programa'])
            if filtros.get('es_alerta') is not None:
                query = query.filter(Encuesta.es_alerta == filtros['es_alerta'])
        
        encuestas = query.order_by(Encuesta.created_at.desc()).all()
        
        # Escribir datos
        for row_num, encuesta in enumerate(encuestas, start=2):
            usuario = encuesta.usuario
            
            # Obtener respuestas
            respuestas = {r.pregunta_numero: r.valor for r in encuesta.respuestas}
            
            # Obtener estado de alerta
            alerta = db.query(Alerta).filter(Alerta.encuesta_id == encuesta.id).first()
            estado_alerta = alerta.estado if alerta else "N/A"
            
            # Programa o Cargo según tipo de usuario
            programa_cargo = usuario.programa if usuario.tipo_usuario == "estudiante" else usuario.cargo
            promocion = usuario.promocion if usuario.tipo_usuario == "estudiante" else ""
            
            # Escribir fila
            row_data = [
                encuesta.id,
                encuesta.completed_at.strftime("%d/%m/%Y %H:%M") if encuesta.completed_at else "",
                usuario.tipo_usuario,
                f"{usuario.tipo_documento} {usuario.numero_documento}",
                usuario.nombres,
                usuario.apellidos,
                programa_cargo,
                promocion,
                respuestas.get(1, ""),
                respuestas.get(2, ""),
                respuestas.get(3, ""),
                respuestas.get(4, ""),
                respuestas.get(5, ""),
                encuesta.puntaje_raw,
                encuesta.puntaje_final,
                "SÍ" if encuesta.es_alerta else "NO",
                estado_alerta,
                encuesta.comentario or ""
            ]
            
            for col, value in enumerate(row_data, start=1):
                ws.cell(row=row_num, column=col, value=value)
        
        # Ajustar ancho de columnas
        for column in ws.columns:
            max_length = 0
            column_letter = column[0].column_letter
            for cell in column:
                try:
                    if len(str(cell.value)) > max_length:
                        max_length = len(str(cell.value))
                except:
                    pass
            adjusted_width = min(max_length + 2, 50)
            ws.column_dimensions[column_letter].width = adjusted_width
        
        # Guardar en bytes
        output = io.BytesIO()
        wb.save(output)
        output.seek(0)
        
        return output.getvalue()
```

---

## 📄 ARCHIVO 12: `app/routes/auth.py`

```python
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.config.database import get_db
from app.schemas.usuario import EstudianteRegistro, PersonalRegistro, UsuarioResponse
from app.services.auth_service import AuthService
from typing import Dict

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

# Listas predefinidas
PROGRAMAS = [
    "Administración de Empresas",
    "Administración Financiera",
    "Contaduría Pública",
    "Ingeniería de Sistemas",
    "Ingeniería Industrial",
    "Psicología",
    "Derecho",
    "Comunicación Social",
    "Diseño Gráfico",
    "Mercadeo y Publicidad"
]

CARGOS = [
    "Docente Tiempo Completo",
    "Docente Hora Cátedra",
    "Coordinador Académico",
    "Decano",
    "Director de Programa",
    "Psicólogo",
    "Trabajador Social",
    "Secretaria/o",
    "Auxiliar Administrativo",
    "Servicios Generales",
    "Vigilancia",
    "Biblioteca",
    "Sistemas",
    "Otro"
]

@router.post("/registro/estudiante", response_model=UsuarioResponse, status_code=status.HTTP_201_CREATED)
def registrar_estudiante(data: EstudianteRegistro, db: Session = Depends(get_db)):
    """Registra un nuevo estudiante"""
    
    # Validar programa
    if data.programa not in PROGRAMAS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Programa no válido. Selecciona uno de la lista."
        )
    
    usuario = AuthService.create_estudiante(db, data.dict())
    return usuario

@router.post("/registro/personal", response_model=UsuarioResponse, status_code=status.HTTP_201_CREATED)
def registrar_personal(data: PersonalRegistro, db: Session = Depends(get_db)):
    """Registra un nuevo miembro del personal"""
    
    # Validar cargo
    if data.cargo not in CARGOS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cargo no válido. Selecciona uno de la lista."
        )
    
    usuario = AuthService.create_personal(db, data.dict())
    return usuario

@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)) -> Dict:
    """Login con correo y contraseña"""
    
    usuario = AuthService.authenticate_user(db, form_data.username, form_data.password)
    
    # Crear token
    access_token = AuthService.create_access_token(
        data={
            "sub": usuario.correo_institucional,
            "id": usuario.id,
            "rol": usuario.rol
        }
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "usuario": {
            "id": usuario.id,
            "nombres": usuario.nombres,
            "apellidos": usuario.apellidos,
            "correo": usuario.correo_institucional,
            "tipo_usuario": usuario.tipo_usuario,
            "rol": usuario.rol
        }
    }

@router.get("/programas")
def listar_programas():
    """Lista los programas académicos disponibles"""
    return {"programas": PROGRAMAS}

@router.get("/cargos")
def listar_cargos():
    """Lista los cargos disponibles para personal"""
    return {"cargos": CARGOS}
```

---

## 📄 ARCHIVO 13: `app/routes/encuestas.py`

```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List
from app.config.database import get_db
from app.models.usuario import Usuario
from app.models.encuesta import Encuesta
from app.models.respuesta import Respuesta
from app.models.alerta import Alerta
from app.schemas.encuesta import EncuestaCreate, EncuestaResponse, EncuestaDetalle
from app.services.who5_service import WHO5Service
from app.utils.security import get_current_user

router = APIRouter()

@router.post("/consentimiento")
def aceptar_consentimiento(
    can_contact: bool,
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
```

---

## 📄 ARCHIVO 14: `app/routes/dashboard.py`

```python
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func, case, and_, or_
from datetime import datetime, timedelta
from typing import Optional
from app.config.database import get_db
from app.models.usuario import Usuario
from app.models.encuesta import Encuesta
from app.models.respuesta import Respuesta
from app.models.alerta import Alerta
from app.services.export_service import ExportService
from app.utils.security import get_current_user, require_role

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
```

---

## 📄 ARCHIVO 15: `app/utils/security.py`

```python
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from typing import List
from app.config.settings import settings
from app.config.database import get_db
from app.models.usuario import Usuario

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> Usuario:
    """Obtiene el usuario actual desde el token JWT"""
    
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudo validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        correo: str = payload.get("sub")
        if correo is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    usuario = db.query(Usuario).filter(Usuario.correo_institucional == correo).first()
    
    if usuario is None:
        raise credentials_exception
    
    if not usuario.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuario inactivo"
        )
    
    return usuario

def require_role(roles: List[str]):
    """Decorador para requerir roles específicos"""
    
    def role_checker(current_user: Usuario = Depends(get_current_user)):
        if current_user.rol not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes permisos para acceder a este recurso"
            )
        return current_user
    
    return role_checker
```

---

## 📄 ARCHIVO 16: `app/main.py`

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config.settings import settings
from app.config.database import Base, engine
from app.routes import auth, encuestas, dashboard

# Crear tablas
Base.metadata.create_all(bind=engine)

# Crear app
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Sistema de Bienestar Universitario - Índice WHO-5"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir routers
app.include_router(auth.router, prefix="/api/auth", tags=["Autenticación"])
app.include_router(encuestas.router, prefix="/api/encuestas", tags=["Encuestas"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])

@app.get("/")
def root():
    return {
        "message": "API de Bienestar Universitario - WHO-5",
        "version": settings.VERSION,
        "docs": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
```

---

## 📄 ARCHIVO 17: `requirements.txt`

```txt
fastapi==0.109.0
uvicorn[standard]==0.27.0
sqlalchemy==2.0.25
psycopg2-binary==2.9.9
alembic==1.13.1
pydantic==2.5.3
pydantic-settings==2.1.0
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6
openpyxl==3.1.2
pandas==2.1.4
python-dotenv==1.0.0
```

---

## 📄 ARCHIVO 18: `.env.example`

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/bienestar_who5

# JWT
SECRET_KEY=your-super-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# CORS
ALLOWED_ORIGINS=["http://localhost:5173","http://localhost:3000"]

# Universidad
UNIVERSIDAD_NOMBRE=Uniempresarial
DOMINIO_ESTUDIANTES=@estudiantes.uniempresarial.edu.co
DOMINIO_PERSONAL=@uniempresarial.edu.co

# WHO-5
WHO5_UMBRAL_ALERTA=13
WHO5_CAMBIO_SIGNIFICATIVO=10

# Email (opcional)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=
SMTP_PASSWORD=
```

---

**BACKEND COMPLETO** ✅

Para ejecutar:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Editar .env con tus credenciales
uvicorn app.main:app --reload
```

**CONTINÚA EN: FRONTEND_CODIGO_COMPLETO.md**
