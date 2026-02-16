# Sistema de Bienestar Universitario - WHO-5

Sistema completo de evaluación de bienestar emocional utilizando el índice WHO-5 de la Organización Mundial de la Salud.

## Estructura del Proyecto

```
TermometroUniSalud/
├── backend/          # API FastAPI
├── frontend/         # Aplicación React + TypeScript
└── PlanTrabajo/      # Documentación del proyecto
```

## Requisitos Previos

- Python 3.11+
- Node.js 18+
- PostgreSQL 14+
- npm 9+

## Configuración del Backend

1. Crear entorno virtual:
```bash
cd backend
python -m venv venv
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate
```

2. Instalar dependencias:
```bash
pip install -r requirements.txt
```

3. Configurar base de datos:
- Crear base de datos PostgreSQL: `bienestar_who5`
- Copiar `.env.example` a `.env` y configurar las variables

4. Ejecutar migraciones (si usas Alembic):
```bash
alembic upgrade head
```

5. Iniciar servidor:
```bash
uvicorn app.main:app --reload
```

El backend estará disponible en `http://localhost:8000`
Documentación API: `http://localhost:8000/docs`

## Configuración del Frontend

1. Instalar dependencias:
```bash
cd frontend
npm install
```

2. Configurar variables de entorno:
- Copiar `.env.example` a `.env`
- Configurar `VITE_API_URL` con la URL del backend

3. Iniciar servidor de desarrollo:
```bash
npm run dev
```

El frontend estará disponible en `http://localhost:5173`

## Funcionalidades

### Para Usuarios (Estudiantes y Personal)
- Registro de cuenta
- Login
- Consentimiento informado
- Encuesta WHO-5 (5 preguntas)
- Visualización de resultados
- Historial de encuestas

### Para Administradores/Psicólogos
- Dashboard con métricas
- Gestión de alertas
- Exportación a Excel
- Filtros por período, tipo de usuario, programa

## Variables de Entorno

### Backend (.env)
```
DATABASE_URL=postgresql://user:password@localhost:5432/bienestar_who5
SECRET_KEY=tu-secret-key-seguro
ALLOWED_ORIGINS=["http://localhost:5173"]
WHO5_UMBRAL_ALERTA=13
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:8000/api
```

## Testing

### Backend
```bash
cd backend
pytest tests/
```

### Frontend
```bash
cd frontend
npm test
```

## Producción

### Backend
```bash
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker
```

### Frontend
```bash
npm run build
# Servir archivos de la carpeta dist/
```

## Licencia

Este proyecto es propiedad de Uniempresarial.
