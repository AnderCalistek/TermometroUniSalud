# 🚀 PROMPT MAESTRO PARA DESARROLLO COMPLETO
## Sistema de Bienestar Universitario - WHO-5 Index

**Versión:** 2.0 - Actualizada con WHO-5  
**Fecha:** 13 de Febrero, 2026  
**Duración estimada:** 4-6 semanas  
**Nivel:** Fullstack Intermediate-Advanced  

---

## 📋 ÍNDICE RÁPIDO

1. [Pre-requisitos](#pre-requisitos)
2. [Semana 1-2: Backend](#semana-1-2-backend)
3. [Semana 3-4: Frontend](#semana-3-4-frontend)
4. [Semana 5: Integración y Testing](#semana-5-integración)
5. [Semana 6: Deployment](#semana-6-deployment)
6. [Checklist Final](#checklist-final)

---

## 🎯 PRE-REQUISITOS

### Software Necesario:
```bash
# Verificar instalaciones
python --version  # 3.11+
node --version    # 18+
npm --version     # 9+
postgres --version  # 14+
git --version
```

### Crear Proyecto Base:
```bash
mkdir bienestar-who5
cd bienestar-who5
git init
echo "# Sistema de Bienestar WHO-5" > README.md
git add .
git commit -m "Initial commit"
```

---

## 📦 SEMANA 1-2: BACKEND

### DÍA 1: Setup Inicial

#### 1.1 Crear Base de Datos PostgreSQL

```sql
-- Conectarse a PostgreSQL
CREATE DATABASE bienestar_who5;
CREATE USER bienestar_admin WITH PASSWORD 'tu_password_seguro';
GRANT ALL PRIVILEGES ON DATABASE bienestar_who5 TO bienestar_admin;
```

#### 1.2 Estructura del Proyecto Backend

```bash
mkdir backend
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate

# Crear estructura
mkdir -p app/{config,models,schemas,services,routes,utils}
touch app/__init__.py
touch app/{config,models,schemas,services,routes,utils}/__init__.py
```

#### 1.3 Instalar Dependencias

```bash
pip install fastapi==0.109.0
pip install uvicorn[standard]==0.27.0
pip install sqlalchemy==2.0.25
pip install psycopg2-binary==2.9.9
pip install alembic==1.13.1
pip install pydantic==2.5.3
pip install pydantic-settings==2.1.0
pip install python-jose[cryptography]==3.3.0
pip install passlib[bcrypt]==1.7.4
pip install python-multipart==0.0.6
pip install openpyxl==3.1.2
pip install pandas==2.1.4
pip install python-dotenv==1.0.0

# Guardar dependencias
pip freeze > requirements.txt
```

#### 1.4 Crear `.env`

```bash
cat > .env << 'EOF'
DATABASE_URL=postgresql://bienestar_admin:tu_password_seguro@localhost:5432/bienestar_who5
SECRET_KEY=genera-un-secret-key-aleatorio-muy-largo
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
ALLOWED_ORIGINS=["http://localhost:5173"]
UNIVERSIDAD_NOMBRE=Uniempresarial
DOMINIO_ESTUDIANTES=@estudiantes.uniempresarial.edu.co
DOMINIO_PERSONAL=@uniempresarial.edu.co
WHO5_UMBRAL_ALERTA=13
WHO5_CAMBIO_SIGNIFICATIVO=10
EOF
```

**⚠️ IMPORTANTE:** Genera un SECRET_KEY aleatorio:
```python
import secrets
print(secrets.token_urlsafe(32))
```

---

### DÍA 2-3: Modelos de Base de Datos

**Copiar código de:** `BACKEND_CODIGO_COMPLETO_PARTE1.md`

Archivos a crear:
1. `app/config/settings.py`
2. `app/config/database.py`
3. `app/models/usuario.py`
4. `app/models/encuesta.py`
5. `app/models/respuesta.py`
6. `app/models/alerta.py`

#### Crear Migraciones con Alembic:

```bash
cd backend
alembic init migrations

# Editar alembic.ini: configurar sqlalchemy.url
# Editar migrations/env.py: importar Base y models

# Crear primera migración
alembic revision --autogenerate -m "Initial schema - WHO5"
alembic upgrade head
```

**✅ Verificar:** Tablas creadas en PostgreSQL
```sql
\c bienestar_who5
\dt
```

---

### DÍA 4-5: Servicios y Schemas

**Copiar código de:**
- `BACKEND_CODIGO_COMPLETO_PARTE1.md` (schemas/usuario.py, schemas/encuesta.py)
- `BACKEND_CODIGO_COMPLETO_PARTE2.md` (services/)

Archivos a crear:
1. `app/schemas/usuario.py`
2. `app/schemas/encuesta.py`
3. `app/services/auth_service.py`
4. `app/services/who5_service.py`
5. `app/services/export_service.py`

**✅ Test WHO-5 Service:**
```python
# test_who5.py
from app.services.who5_service import WHO5Service

# Test cálculo
respuestas = [5, 4, 3, 2, 1]
raw = WHO5Service.calcular_puntaje_raw(respuestas)
final = WHO5Service.calcular_puntaje_final(raw)
print(f"Raw: {raw}, Final: {final}")  # Raw: 15, Final: 60

# Test alerta
alerta = WHO5Service.es_alerta(12)
print(f"¿Es alerta?: {alerta}")  # True

# Test clasificación
clasificacion = WHO5Service.clasificar_bienestar(60)
print(clasificacion)
```

---

### DÍA 6-8: Rutas API

**Copiar código de:** `BACKEND_CODIGO_COMPLETO_PARTE2.md`

Archivos a crear:
1. `app/routes/auth.py`
2. `app/routes/encuestas.py`
3. `app/routes/dashboard.py`
4. `app/utils/security.py`
5. `app/main.py`

#### Ejecutar Backend:

```bash
cd backend
source venv/bin/activate  # o venv\Scripts\activate en Windows
uvicorn app.main:app --reload
```

**✅ Verificar:**
- Abrir: `http://localhost:8000/docs`
- Debe aparecer Swagger UI con todos los endpoints

---

### DÍA 9-10: Testing Backend

#### Crear Tests:

```bash
mkdir tests
touch tests/__init__.py
touch tests/test_auth.py
touch tests/test_encuestas.py
```

**test_auth.py:**
```python
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_registro_estudiante():
    response = client.post("/api/auth/registro/estudiante", json={
        "nombres": "Test",
        "apellidos": "Usuario",
        "tipo_documento": "CC",
        "numero_documento": "1234567890",
        "correo_institucional": "test@estudiantes.uniempresarial.edu.co",
        "password": "Test1234",
        "programa": "Ingeniería de Sistemas",
        "promocion": "2024-1"
    })
    assert response.status_code == 201
    assert "id" in response.json()

def test_login():
    # Primero registrar
    # Luego intentar login
    response = client.post("/api/auth/login", data={
        "username": "test@estudiantes.uniempresarial.edu.co",
        "password": "Test1234"
    })
    assert response.status_code == 200
    assert "access_token" in response.json()
```

**Ejecutar tests:**
```bash
pip install pytest pytest-asyncio httpx
pytest tests/ -v
```

---

## ⚛️ SEMANA 3-4: FRONTEND

### DÍA 11: Setup Inicial Frontend

```bash
cd ..  # Volver a raíz del proyecto
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install
```

#### Instalar Dependencias:

```bash
npm install react-router-dom@6
npm install @tanstack/react-query@5
npm install axios
npm install zustand
npm install zod
npm install react-hook-form
npm install @hookform/resolvers
npm install framer-motion
npm install lucide-react
npm install sonner
npm install clsx
npm install recharts
```

#### shadcn/ui (opcional pero recomendado):

```bash
npx shadcn-ui@latest init
```

---

### DÍA 12-13: Estructura y Servicios

**Crear estructura:**
```bash
mkdir -p src/{lib,stores,services,hooks,components,pages,types}
mkdir -p src/pages/dashboard
```

**Copiar código de:** `FRONTEND_CODIGO_COMPLETO_PARTE1.md`

Archivos a crear:
1. `src/types/index.ts`
2. `src/lib/api.ts`
3. `src/stores/authStore.ts`
4. `src/services/authService.ts`
5. `src/services/encuestaService.ts`
6. `src/services/dashboardService.ts`

**Actualizar `src/main.tsx`:**
```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import './index.css'

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
)
```

---

### DÍA 14-16: Páginas de Autenticación

**Copiar código de:** `FRONTEND_CODIGO_COMPLETO_PARTE1.md`

Archivos a crear:
1. `src/pages/Landing.tsx`
2. `src/pages/RegistroEstudiante.tsx`
3. `src/pages/RegistroPersonal.tsx`
4. `src/pages/Login.tsx`

**Actualizar `src/App.tsx`:**
```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { Landing } from './pages/Landing'
import { RegistroEstudiantePage } from './pages/RegistroEstudiante'
import { RegistroPersonalPage } from './pages/RegistroPersonal'
import { LoginPage } from './pages/Login'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/registro/estudiante" element={<RegistroEstudiantePage />} />
        <Route path="/registro/personal" element={<RegistroPersonalPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
      <Toaster position="top-center" richColors />
    </BrowserRouter>
  )
}

export default App
```

**Ejecutar frontend:**
```bash
npm run dev
```

**✅ Verificar:**
- Abrir `http://localhost:5173`
- Probar registro de estudiante
- Probar login

---

### DÍA 17-19: Páginas de Encuesta WHO-5

Crear archivos:
1. `src/pages/Consentimiento.tsx`
2. `src/pages/EncuestaWHO5.tsx`
3. `src/pages/Resultado.tsx`

**`src/pages/EncuestaWHO5.tsx` (ejemplo simplificado):**

```typescript
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { encuestaService } from '../services/encuestaService';
import { RespuestaWHO5 } from '../types';

export function EncuestaWHO5Page() {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [respuestas, setRespuestas] = useState<RespuestaWHO5[]>([]);
  const [comentario, setComentario] = useState('');
  
  const { data: preguntasData } = useQuery({
    queryKey: ['preguntas-who5'],
    queryFn: encuestaService.obtenerPreguntas
  });
  
  const enviarMutation = useMutation({
    mutationFn: encuestaService.enviarEncuesta,
    onSuccess: (data) => {
      navigate(`/resultado/${data.id}`);
    },
    onError: () => {
      toast.error('Error al enviar encuesta');
    }
  });
  
  const preguntas = preguntasData?.preguntas || [];
  const preguntaActual = preguntas[currentQuestion];
  
  const handleRespuesta = (valor: number) => {
    const nuevasRespuestas = [...respuestas];
    const index = nuevasRespuestas.findIndex(r => r.pregunta_numero === currentQuestion + 1);
    
    if (index >= 0) {
      nuevasRespuestas[index].valor = valor;
    } else {
      nuevasRespuestas.push({
        pregunta_numero: currentQuestion + 1,
        valor
      });
    }
    
    setRespuestas(nuevasRespuestas);
  };
  
  const handleNext = () => {
    if (currentQuestion < preguntas.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      // Última pregunta - mostrar paso de comentario
      handleFinalizar();
    }
  };
  
  const handleFinalizar = () => {
    if (respuestas.length !== 5) {
      toast.error('Debes responder todas las preguntas');
      return;
    }
    
    enviarMutation.mutate({
      respuestas,
      comentario,
      can_contact: false
    });
  };
  
  const respuestaActual = respuestas.find(r => r.pregunta_numero === currentQuestion + 1);
  
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Header con progreso */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Pregunta {currentQuestion + 1} de {preguntas.length}</span>
            <span>{Math.round((currentQuestion + 1) / preguntas.length * 100)}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full">
            <div 
              className="h-full bg-blue-600 rounded-full transition-all duration-300"
              style={{ width: `${(currentQuestion + 1) / preguntas.length * 100}%` }}
            />
          </div>
        </div>
        
        {/* Pregunta */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="bg-blue-50 border-l-4 border-blue-600 p-4 mb-8 rounded-r-lg">
            <p className="text-sm text-gray-700">
              Durante las <strong>últimas 2 semanas</strong>, ¿con qué frecuencia has experimentado:
            </p>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            {preguntaActual?.texto}
          </h2>
          
          {/* Opciones */}
          <div className="space-y-3">
            {preguntaActual?.opciones.map((opcion) => (
              <button
                key={opcion.valor}
                onClick={() => handleRespuesta(opcion.valor)}
                className={`
                  w-full p-4 text-left rounded-xl border-2 transition-all
                  ${respuestaActual?.valor === opcion.valor
                    ? 'border-blue-600 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">{opcion.label}</span>
                  <span className="text-sm text-gray-500">({opcion.valor})</span>
                </div>
              </button>
            ))}
          </div>
          
          {/* Botones navegación */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <button
              onClick={() => setCurrentQuestion(prev => prev - 1)}
              disabled={currentQuestion === 0}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Anterior
            </button>
            <button
              onClick={handleNext}
              disabled={!respuestaActual}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {currentQuestion === preguntas.length - 1 ? 'Finalizar' : 'Siguiente →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

### DÍA 20-21: Dashboard Administrativo

Crear archivos:
1. `src/pages/dashboard/Dashboard.tsx`
2. `src/pages/dashboard/Alertas.tsx`
3. `src/components/ProtectedRoute.tsx`

**`src/components/ProtectedRoute.tsx`:**
```typescript
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

interface Props {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export function ProtectedRoute({ children, allowedRoles }: Props) {
  const { isAuthenticated, user } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user?.rol || '')) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}
```

**Actualizar rutas en `App.tsx`:**
```typescript
<Route path="/dashboard" element={
  <ProtectedRoute allowedRoles={['admin', 'psicologo', 'analista']}>
    <DashboardPage />
  </ProtectedRoute>
} />
```

---

## 🔗 SEMANA 5: INTEGRACIÓN Y TESTING

### DÍA 22-23: Integración Completa

**Checklist de integración:**
- [ ] Registro de estudiante → Login → Consentimiento → Encuesta → Resultado
- [ ] Registro de personal → Login → Consentimiento → Encuesta → Resultado
- [ ] Admin Login → Dashboard → Ver métricas → Ver alertas → Exportar Excel
- [ ] Manejo de errores en todos los flujos
- [ ] Loading states en todas las peticiones
- [ ] Validaciones client-side y server-side

---

### DÍA 24-25: Testing E2E

**Instalar Playwright:**
```bash
cd frontend
npm install -D @playwright/test
npx playwright install
```

**Crear `tests/e2e/registro.spec.ts`:**
```typescript
import { test, expect } from '@playwright/test';

test('Flujo completo estudiante', async ({ page }) => {
  // 1. Ir a landing
  await page.goto('http://localhost:5173');
  await expect(page.locator('h1')).toContainText('Bienestar');
  
  // 2. Ir a registro
  await page.click('text=Registrarse como Estudiante');
  
  // 3. Llenar formulario
  await page.fill('input[name="nombres"]', 'Test E2E');
  await page.fill('input[name="apellidos"]', 'Playwright');
  await page.selectOption('select[name="tipo_documento"]', 'CC');
  await page.fill('input[name="numero_documento"]', '9999999999');
  await page.fill('input[name="correo_institucional"]', 'test.e2e@estudiantes.uniempresarial.edu.co');
  await page.selectOption('select[name="programa"]', 'Ingeniería de Sistemas');
  await page.fill('input[name="promocion"]', '2024-1');
  await page.fill('input[name="password"]', 'Test1234');
  await page.fill('input[name="confirmar_password"]', 'Test1234');
  
  // 4. Enviar
  await page.click('button[type="submit"]');
  
  // 5. Verificar éxito
  await expect(page).toHaveURL(/.*login/);
});
```

**Ejecutar:**
```bash
npx playwright test
```

---

### DÍA 26-27: Optimizaciones

**Performance:**
```typescript
// Lazy loading de rutas
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'));
const Alertas = lazy(() => import('./pages/dashboard/Alertas'));

<Route path="/dashboard" element={
  <Suspense fallback={<LoadingSpinner />}>
    <Dashboard />
  </Suspense>
} />
```

**Memoización:**
```typescript
const KPICard = React.memo(({ title, value, change }) => {
  // ...
});
```

---

## 🚀 SEMANA 6: DEPLOYMENT

### DÍA 28: Preparación

**Backend:**
```bash
cd backend
pip install gunicorn
```

**Frontend:**
```bash
cd frontend
npm run build
```

---

### DÍA 29-30: Deploy

#### Backend en Railway/Render:

1. Crear cuenta en Railway.app
2. New Project → Deploy from GitHub
3. Configurar variables de entorno
4. Deploy

#### Frontend en Vercel:

1. Crear cuenta en Vercel
2. Import Git Repository
3. Configurar build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Añadir variable de entorno:
   - `VITE_API_URL`: URL del backend
5. Deploy

---

## ✅ CHECKLIST FINAL

### Funcionalidad:
- [ ] Registro estudiante funciona
- [ ] Registro personal funciona
- [ ] Login funciona
- [ ] Consentimiento se guarda correctamente
- [ ] Encuesta WHO-5 calcula puntaje correcto
- [ ] Alertas se crean cuando puntaje < 13
- [ ] Dashboard muestra métricas reales
- [ ] Exportar a Excel funciona
- [ ] Resolver alertas funciona

### Seguridad:
- [ ] Passwords hasheados con bcrypt
- [ ] JWT tokens funcionando
- [ ] HTTPS configurado en producción
- [ ] CORS configurado correctamente
- [ ] Validaciones en backend y frontend
- [ ] No se exponen documentos completos

### UX:
- [ ] Responsive en mobile/tablet/desktop
- [ ] Loading states en todos los formularios
- [ ] Mensajes de error claros
- [ ] Navegación intuitiva
- [ ] Textos del consentimiento claros

### Datos:
- [ ] Base de datos con backups configurados
- [ ] Logs de auditoría funcionando
- [ ] Eliminación de datos funciona
- [ ] Exportación correcta de datos

---

## 📚 DOCUMENTACIÓN ADICIONAL

Consultar:
- `ESPECIFICACIONES_ACTUALIZADAS.md` - Especificaciones detalladas
- `BACKEND_CODIGO_COMPLETO_PARTE1.md` - Código backend (modelos)
- `BACKEND_CODIGO_COMPLETO_PARTE2.md` - Código backend (rutas)
- `FRONTEND_CODIGO_COMPLETO_PARTE1.md` - Código frontend

---

## 🆘 TROUBLESHOOTING

### Error: Base de datos no conecta
```bash
# Verificar PostgreSQL está corriendo
sudo service postgresql status

# Verificar credenciales en .env
cat .env | grep DATABASE_URL
```

### Error: CORS en desarrollo
```python
# app/main.py
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173"
]
```

### Error: JWT token inválido
```typescript
// Limpiar storage
localStorage.clear();
// Intentar login de nuevo
```

---

## 🎯 ÉXITO DEL PROYECTO

Al completar este prompt tendrás:

✅ Sistema completo de bienestar universitario  
✅ Instrumento WHO-5 implementado correctamente  
✅ Registro obligatorio para todos los usuarios  
✅ Dashboard administrativo funcional  
✅ Exportación a Excel  
✅ Sistema de alertas automático  
✅ Código de calidad profesional  
✅ Tests automatizados  
✅ Deployado en producción  

**¡Adelante! 🚀**
