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
