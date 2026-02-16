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
