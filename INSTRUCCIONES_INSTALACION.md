# 📋 Instrucciones de Instalación y Configuración

## ✅ Estado del Proyecto

El proyecto está **completamente implementado** y listo para ser probado. Todos los archivos han sido creados según la especificación.

## 🚀 Pasos para Poner en Funcionamiento

### 1. Configurar Base de Datos PostgreSQL

```sql
-- Conectarse a PostgreSQL como superusuario
CREATE DATABASE bienestar_who5;
CREATE USER bienestar_admin WITH PASSWORD 'tu_password_seguro';
GRANT ALL PRIVILEGES ON DATABASE bienestar_who5 TO bienestar_admin;
```

### 2. Configurar Backend

```bash
# Navegar al directorio backend
cd backend

# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Crear archivo .env desde el ejemplo
cp .env.example .env

# Editar .env con tus credenciales:
# - DATABASE_URL con tus credenciales de PostgreSQL
# - SECRET_KEY: generar uno nuevo con: python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### 3. Crear Tablas en la Base de Datos

El backend creará automáticamente las tablas al iniciarse por primera vez (ver `app/main.py` línea 866).

Alternativamente, puedes usar Alembic:

```bash
# Inicializar Alembic (si no está inicializado)
alembic init migrations

# Crear migración inicial
alembic revision --autogenerate -m "Initial schema"

# Aplicar migraciones
alembic upgrade head
```

### 4. Iniciar Backend

```bash
# Asegúrate de estar en el directorio backend con el venv activado
uvicorn app.main:app --reload
```

El backend estará disponible en: `http://localhost:8000`
Documentación API: `http://localhost:8000/docs`

### 5. Configurar Frontend

```bash
# Navegar al directorio frontend
cd frontend

# Instalar dependencias 
npm install

# Crear archivo .env
cp .env.example .env

# Editar .env:
# VITE_API_URL=http://localhost:8000/api
```

### 6. Iniciar Frontend

```bash
# Asegúrate de estar en el directorio frontend
npm run dev
```

El frontend estará disponible en: `http://localhost:5173`

## 🧪 Probar el Sistema

### Flujo Completo de Usuario:

1. **Registro de Estudiante:**
   - Ir a `http://localhost:5173`
   - Click en "Registrarse como Estudiante"
   - Llenar formulario con datos de prueba:
     - Correo: `test@estudiantes.uniempresarial.edu.co`
     - Programa: Seleccionar uno de la lista
     - Promoción: `2024-1`
   - Registrar

2. **Login:**
   - Usar el correo y contraseña registrados
   - Debería redirigir a `/consentimiento`

3. **Consentimiento:**
   - Leer y aceptar el consentimiento
   - Opcionalmente marcar "Autorizo contacto"
   - Continuar

4. **Encuesta WHO-5:**
   - Responder las 5 preguntas
   - Agregar comentario opcional
   - Finalizar

5. **Resultado:**
   - Ver el resultado de la encuesta
   - Si el puntaje es < 13, ver alerta

### Flujo de Administrador:

1. **Crear Usuario Admin** (desde Python shell):
```python
from app.config.database import SessionLocal
from app.models.usuario import Usuario, TipoUsuario, TipoDocumento, Rol
from app.services.auth_service import AuthService

db = SessionLocal()
admin = Usuario(
    tipo_usuario=TipoUsuario.ADMIN,
    nombres="Admin",
    apellidos="Sistema",
    tipo_documento=TipoDocumento.CC,
    numero_documento="0000000000",
    correo_institucional="admin@uniempresarial.edu.co",
    password_hash=AuthService.get_password_hash("Admin1234"),
    rol=Rol.ADMIN,
    cargo="Administrador",
    consent_accepted=True
)
db.add(admin)
db.commit()
```

2. **Login como Admin:**
   - Usar: `admin@uniempresarial.edu.co` / `Admin1234`
   - Debería redirigir a `/dashboard`

3. **Dashboard:**
   - Ver métricas
   - Ver alertas
   - Exportar a Excel

## 🔧 Solución de Problemas

### Error: Base de datos no conecta
- Verificar que PostgreSQL esté corriendo
- Verificar credenciales en `.env`
- Verificar que la base de datos `bienestar_who5` exista

### Error: CORS en desarrollo
- Verificar que `ALLOWED_ORIGINS` en `.env` incluya `http://localhost:5173`
- Reiniciar el backend después de cambiar `.env`

### Error: Módulo no encontrado (Python)
- Asegurarse de que el entorno virtual esté activado
- Ejecutar `pip install -r requirements.txt` nuevamente

### Error: Módulo no encontrado (Node)
- Ejecutar `npm install` en el directorio frontend
- Verificar que `node_modules` exista

### Error: Tailwind no funciona
- Verificar que `tailwind.config.js` y `postcss.config.js` existan
- Verificar que `index.css` tenga las directivas de Tailwind

## 📝 Notas Importantes

1. **SECRET_KEY**: Debe ser único y seguro en producción
2. **Base de Datos**: Las tablas se crean automáticamente al iniciar el backend
3. **CORS**: Configurado para desarrollo local, ajustar para producción
4. **Variables de Entorno**: Nunca commitees el archivo `.env` (está en `.gitignore`)

## 🎯 Próximos Pasos para Producción

1. Configurar HTTPS
2. Usar variables de entorno seguras
3. Configurar backups de base de datos
4. Configurar logging y monitoreo
5. Optimizar para producción (minificar frontend, etc.)

## ✅ Checklist de Verificación

- [ ] PostgreSQL instalado y corriendo
- [ ] Base de datos `bienestar_who5` creada
- [ ] Backend `.env` configurado
- [ ] Backend corriendo en `http://localhost:8000`
- [ ] Frontend `.env` configurado
- [ ] Frontend corriendo en `http://localhost:5173`
- [ ] Puedo registrar un estudiante
- [ ] Puedo hacer login
- [ ] Puedo completar una encuesta
- [ ] Puedo ver el resultado
- [ ] Dashboard muestra métricas (si soy admin)

¡El proyecto está listo para probar! 🚀
