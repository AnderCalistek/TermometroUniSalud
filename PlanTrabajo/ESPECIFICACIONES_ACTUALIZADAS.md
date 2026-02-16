# 📋 ESPECIFICACIONES COMPLETAS ACTUALIZADAS
## Sistema de Bienestar Universitario - Índice WHO-5

**Última actualización:** 13 de Febrero, 2026  
**Instrumento utilizado:** WHO-5 Well-Being Index (OMS)  
**Modalidad:** Todos los usuarios deben registrarse (eliminado modo anónimo)

---

## 🎯 CAMBIOS CRÍTICOS RESPECTO A LA VERSIÓN ANTERIOR

### ❌ ELIMINADO:
- ~~Modo de participación anónima~~
- ~~PHQ-9 (9 preguntas de depresión)~~
- ~~Pregunta centinela de ideación suicida~~
- ~~Login opcional~~

### ✅ NUEVO:
- **WHO-5 Index**: 5 preguntas de bienestar (escala 0-5)
- **Registro obligatorio** para todos los usuarios
- **Dos tipos de usuario**: Estudiante y Personal Universitario
- **Consentimiento informado actualizado** específico para WHO-5
- **Sistema de puntuación**: 0-100 puntos
- **Umbral de alerta**: Puntaje < 13
- **Exportación a Excel** desde dashboard

---

## 📊 INSTRUMENTO: WHO-5 WELL-BEING INDEX

### Características Técnicas:

**Nombre completo:** WHO (Five) Well-Being Index (versión 1998)  
**Organización:** Organización Mundial de la Salud  
**Tipo:** Instrumento de tamizaje de bienestar emocional  
**Número de preguntas:** 5  
**Tiempo de aplicación:** 2-3 minutos  
**Período evaluado:** Últimas 2 semanas  

### Preguntas (Traducción Oficial en Español):

**Instrucción:** "Durante las últimas dos semanas:"

1. **Me he sentido alegre y de buen humor**
2. **Me he sentido tranquilo y relajado**
3. **Me he sentido activo y enérgico**
4. **Me he despertado fresco y descansado**
5. **Mi vida cotidiana ha estado llena de cosas que me interesan**

### Opciones de Respuesta:

| Opción | Valor | Descripción |
|--------|-------|-------------|
| Todo el tiempo | 5 | Máxima frecuencia |
| La mayor parte del tiempo | 4 | Alta frecuencia |
| Más de la mitad del tiempo | 3 | Frecuencia moderada-alta |
| Menos de la mitad del tiempo | 2 | Frecuencia moderada-baja |
| De vez en cuando | 1 | Baja frecuencia |
| Nunca | 0 | Mínima frecuencia |

### Sistema de Puntuación:

**Fórmula:**
```
Puntuación Raw = Suma de las 5 respuestas (0-25)
Puntuación Final = Puntuación Raw × 4
Rango: 0-100 puntos
```

**Ejemplo:**
```
Respuestas: [5, 4, 3, 2, 1]
Raw = 5+4+3+2+1 = 15
Final = 15 × 4 = 60 puntos
```

### Interpretación Clínica:

| Puntaje | Interpretación | Acción Recomendada |
|---------|----------------|-------------------|
| 0-12 | **Bajo bienestar** | ⚠️ **ALERTA** - Remitir a evaluación |
| 13-50 | Bienestar moderado | Seguimiento preventivo |
| 51-75 | Buen bienestar | Mantener |
| 76-100 | Excelente bienestar | Felicitar |

**CRÍTICO:** Puntaje < 13 = **Alerta automática** en el sistema

### Monitoreo de Cambios:

**Diferencia significativa:** ±10 puntos entre dos mediciones  
**Ejemplo:**
- Primera medición: 52 puntos
- Segunda medición: 40 puntos
- Diferencia: -12 puntos → **Cambio significativo** (empeoramiento)

---

## 👥 SISTEMA DE USUARIOS ACTUALIZADO

### Tipos de Usuario:

#### 1. **ESTUDIANTE**
Campos de registro obligatorios:
```json
{
  "tipo_usuario": "estudiante",
  "nombres": "Juan Carlos",
  "apellidos": "Pérez García",
  "tipo_documento": "CC" | "TI",
  "numero_documento": "1234567890",
  "correo_institucional": "juan.perez@estudiantes.uniempresarial.edu.co",
  "programa": "Ingeniería de Sistemas",
  "promocion": "2024-1"  // Semestre de ingreso
}
```

**Validaciones:**
- Correo debe terminar en `@estudiantes.uniempresarial.edu.co`
- Documento debe ser único
- Programa debe estar en lista predefinida
- Promoción formato: YYYY-N (N = 1 o 2)

#### 2. **PERSONAL UNIVERSITARIO**
Campos de registro obligatorios:
```json
{
  "tipo_usuario": "personal",
  "nombres": "María Fernanda",
  "apellidos": "López Rodríguez",
  "tipo_documento": "CC" | "TI",
  "numero_documento": "9876543210",
  "correo_institucional": "maria.lopez@uniempresarial.edu.co",
  "cargo": "Docente Tiempo Completo"
}
```

**Validaciones:**
- Correo debe terminar en `@uniempresarial.edu.co` (sin "estudiantes")
- Documento debe ser único
- Cargo debe estar en lista predefinida

#### 3. **ADMINISTRADOR/PSICÓLOGO**
Campos adicionales (creado desde backend):
```json
{
  "tipo_usuario": "admin" | "psicologo",
  "rol": "admin" | "psicologo" | "analista",
  // + campos de personal
}
```

### Listas Predefinidas:

**Programas Académicos:**
```python
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
```

**Cargos Personal:**
```python
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
```

---

## 📄 CONSENTIMIENTO INFORMADO ACTUALIZADO

### Texto Completo:

```
CONSENTIMIENTO INFORMADO
Índice de Bienestar WHO-5

El presente cuestionario corresponde al Índice de Bienestar WHO-5, un instrumento 
breve de tamizaje desarrollado por la Organización Mundial de la Salud, cuyo propósito 
es explorar de manera general el nivel de bienestar emocional durante las últimas dos 
semanas en el marco de su experiencia académica y personal.

La participación en este tamizaje es voluntaria. La información recolectada será tratada 
con estricta confidencialidad y utilizada exclusivamente con fines preventivos, 
psicoeducativos y de orientación, en el marco de las acciones del área de Bienestar 
Universitario.

Este instrumento no genera diagnóstico psicológico ni psiquiátrico, ni reemplaza una 
valoración clínica individual.

Usted puede decidir no participar o retirarse en cualquier momento, sin que ello implique 
consecuencias académicas, laborales, evaluativas o administrativas.

En caso de que las respuestas indiquen posibles alertas en el bienestar emocional, el 
área de Bienestar Universitario podrá ofrecer orientación y remitir, si usted lo autoriza, 
a rutas básicas de atención y acompañamiento psicológico, respetando siempre su 
autonomía y dignidad.

Al continuar con el diligenciamiento del cuestionario, usted declara que:

✓ Ha leído y comprendido la información suministrada.
✓ Acepta participar de manera libre, voluntaria e informada.
✓ Autoriza el uso ético, confidencial y anónimo de la información con fines 
  institucionales de bienestar y prevención.
```

**Campos a capturar:**
- Checkbox: "He leído y acepto el consentimiento informado" (obligatorio)
- Checkbox: "Autorizo a Bienestar Universitario a contactarme si mi puntaje indica alerta" (opcional)
- Fecha y hora de aceptación (automático)

---

## 🗄️ MODELO DE BASE DE DATOS ACTUALIZADO

### Diagrama Relacional:

```
┌─────────────────┐      ┌──────────────────┐      ┌─────────────────┐
│    usuarios     │──┐   │    encuestas     │──┐   │   respuestas    │
├─────────────────┤  │   ├──────────────────┤  │   ├─────────────────┤
│ id (PK)         │  │   │ id (PK)          │  │   │ id (PK)         │
│ tipo_usuario    │  └──<│ usuario_id (FK)  │  └──<│ encuesta_id(FK) │
│ nombres         │      │ created_at       │      │ pregunta_num    │
│ apellidos       │      │ completed_at     │      │ valor (0-5)     │
│ tipo_documento  │      │ puntaje_raw      │      └─────────────────┘
│ num_documento   │      │ puntaje_final    │
│ correo          │      │ es_alerta        │
│ password_hash   │      │ comentario       │
│ rol             │      └──────────────────┘
│ programa (NULL) │
│ promocion(NULL) │      ┌──────────────────┐
│ cargo (NULL)    │      │     alertas      │
│ consent_date    │      ├──────────────────┤
│ can_contact     │      │ id (PK)          │
│ created_at      │   ┌─<│ encuesta_id (FK) │
└─────────────────┘   │  │ prioridad        │
                      │  │ estado           │
                      │  │ atendida_por(FK) │
                      │  │ fecha_atencion   │
                      │  │ accion_tomada    │
                      │  └──────────────────┘
                      │
                      └── Relación con encuestas
```

### Tablas SQL Detalladas:

#### **tabla: usuarios**
```sql
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    tipo_usuario VARCHAR(20) NOT NULL CHECK (tipo_usuario IN ('estudiante', 'personal', 'admin', 'psicologo')),
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    tipo_documento VARCHAR(5) NOT NULL CHECK (tipo_documento IN ('CC', 'TI')),
    numero_documento VARCHAR(20) UNIQUE NOT NULL,
    correo_institucional VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(20) DEFAULT 'user' CHECK (rol IN ('user', 'admin', 'psicologo', 'analista')),
    
    -- Campos específicos ESTUDIANTE (NULL para personal)
    programa VARCHAR(100),
    promocion VARCHAR(10),
    
    -- Campos específicos PERSONAL (NULL para estudiante)
    cargo VARCHAR(100),
    
    -- Consentimiento
    consent_accepted BOOLEAN DEFAULT FALSE,
    consent_date TIMESTAMP,
    can_contact BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    
    CONSTRAINT email_formato CHECK (
        correo_institucional LIKE '%@uniempresarial.edu.co' OR 
        correo_institucional LIKE '%@estudiantes.uniempresarial.edu.co'
    )
);

-- Índices
CREATE INDEX idx_usuarios_documento ON usuarios(numero_documento);
CREATE INDEX idx_usuarios_correo ON usuarios(correo_institucional);
CREATE INDEX idx_usuarios_tipo ON usuarios(tipo_usuario);
```

#### **tabla: encuestas**
```sql
CREATE TABLE encuestas (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    
    -- Resultados WHO-5
    puntaje_raw INTEGER CHECK (puntaje_raw >= 0 AND puntaje_raw <= 25),
    puntaje_final INTEGER CHECK (puntaje_final >= 0 AND puntaje_final <= 100),
    es_alerta BOOLEAN DEFAULT FALSE,  -- TRUE si puntaje_final < 13
    
    -- Comentarios opcionales
    comentario TEXT,
    
    -- Estado
    estado VARCHAR(20) DEFAULT 'completada' CHECK (estado IN ('completada', 'en_revision'))
);

CREATE INDEX idx_encuestas_usuario ON encuestas(usuario_id);
CREATE INDEX idx_encuestas_fecha ON encuestas(completed_at);
CREATE INDEX idx_encuestas_alerta ON encuestas(es_alerta);
```

#### **tabla: respuestas**
```sql
CREATE TABLE respuestas (
    id SERIAL PRIMARY KEY,
    encuesta_id INTEGER NOT NULL REFERENCES encuestas(id) ON DELETE CASCADE,
    pregunta_numero INTEGER NOT NULL CHECK (pregunta_numero BETWEEN 1 AND 5),
    valor INTEGER NOT NULL CHECK (valor BETWEEN 0 AND 5),
    
    UNIQUE(encuesta_id, pregunta_numero)  -- Una respuesta por pregunta
);

CREATE INDEX idx_respuestas_encuesta ON respuestas(encuesta_id);
```

#### **tabla: alertas**
```sql
CREATE TABLE alertas (
    id SERIAL PRIMARY KEY,
    encuesta_id INTEGER NOT NULL REFERENCES encuestas(id) ON DELETE CASCADE,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
    
    -- Metadata de la alerta
    puntaje_obtenido INTEGER NOT NULL,
    prioridad VARCHAR(10) DEFAULT 'media' CHECK (prioridad IN ('alta', 'media')),
    
    -- Estado
    estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'en_atencion', 'resuelta')),
    
    -- Atención
    atendida_por INTEGER REFERENCES usuarios(id),
    fecha_atencion TIMESTAMP,
    accion_tomada TEXT,
    notas_psicologo TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(encuesta_id)  -- Una alerta por encuesta
);

CREATE INDEX idx_alertas_estado ON alertas(estado);
CREATE INDEX idx_alertas_usuario ON alertas(usuario_id);
```

#### **tabla: audit_logs**
```sql
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id),
    accion VARCHAR(100) NOT NULL,
    recurso VARCHAR(100),
    detalles JSONB,
    ip_hash VARCHAR(64),  -- Hash de la IP
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_usuario ON audit_logs(usuario_id);
CREATE INDEX idx_audit_timestamp ON audit_logs(timestamp);
```

---

## 🔐 FLUJO DE AUTENTICACIÓN

### Registro de Usuario:

```mermaid
graph TD
    A[Usuario accede /registro] --> B{Tipo de usuario?}
    B -->|Estudiante| C[Formulario Estudiante]
    B -->|Personal| D[Formulario Personal]
    C --> E[Validar correo @estudiantes...]
    D --> F[Validar correo @uniempresarial.edu.co]
    E --> G[Validar documento único]
    F --> G
    G --> H[Hash password]
    H --> I[Crear usuario en BD]
    I --> J[Enviar email de verificación]
    J --> K[Redireccionar a login]
```

### Login:

```mermaid
graph TD
    A[Usuario ingresa correo+password] --> B[Verificar en BD]
    B -->|Existe| C[Comparar hash password]
    B -->|No existe| D[Error: Usuario no encontrado]
    C -->|Correcto| E[Generar JWT token]
    C -->|Incorrecto| F[Error: Contraseña incorrecta]
    E --> G[Guardar last_login]
    G --> H{Rol del usuario?}
    H -->|user| I[Redireccionar a /consentimiento]
    H -->|admin/psicologo| J[Redireccionar a /dashboard]
```

### Flujo de Encuesta:

```mermaid
graph TD
    A[Usuario logueado] --> B[Mostrar consentimiento]
    B --> C{Acepta?}
    C -->|No| D[Redireccionar a home]
    C -->|Sí| E[Guardar consent_date y can_contact]
    E --> F[Crear encuesta en BD]
    F --> G[Mostrar 5 preguntas WHO-5]
    G --> H[Usuario responde]
    H --> I[Guardar respuestas en tabla respuestas]
    I --> J[Calcular puntaje]
    J --> K{Puntaje < 13?}
    K -->|Sí| L[Crear alerta]
    K -->|No| M[Solo guardar resultado]
    L --> N[Mostrar mensaje con recursos]
    M --> N
    N --> O[Agradecer participación]
```

---

## 📊 DASHBOARD DE ADMINISTRADOR

### Métricas Principales (KPIs):

```javascript
{
  "total_usuarios": 1547,
  "total_encuestas": 892,
  "tasa_participacion": 57.7,  // % de usuarios que han respondido
  "puntaje_promedio": 62.3,
  "alertas_activas": 23,
  "alertas_pendientes": 15,
  "alertas_resueltas": 8,
  "distribucion_puntajes": {
    "0-12": 23,    // Alerta
    "13-50": 234,
    "51-75": 456,
    "76-100": 179
  },
  "tendencia_semanal": [
    { "semana": "Sem 1", "promedio": 58, "participantes": 67 },
    { "semana": "Sem 2", "promedio": 61, "participantes": 89 },
    // ...
  ]
}
```

### Filtros Disponibles:

```javascript
{
  "periodo": "7d" | "30d" | "90d" | "custom",
  "tipo_usuario": "todos" | "estudiante" | "personal",
  "programa": "todos" | "Ingeniería de Sistemas" | ...,
  "puntaje_rango": "todos" | "alerta" | "bajo" | "medio" | "alto",
  "estado_alerta": "todos" | "pendiente" | "resuelta"
}
```

### Exportación a Excel:

**Formato del archivo:**

| Columna | Tipo | Descripción |
|---------|------|-------------|
| ID Encuesta | Número | Identificador único |
| Fecha | Fecha | DD/MM/YYYY HH:MM |
| Tipo Usuario | Texto | estudiante/personal |
| Documento | Texto | Número documento |
| Nombres | Texto | Nombres completos |
| Apellidos | Texto | Apellidos completos |
| Programa/Cargo | Texto | Según tipo usuario |
| Promoción | Texto | Solo estudiantes |
| Pregunta 1 | Número | 0-5 |
| Pregunta 2 | Número | 0-5 |
| Pregunta 3 | Número | 0-5 |
| Pregunta 4 | Número | 0-5 |
| Pregunta 5 | Número | 0-5 |
| Puntaje Raw | Número | 0-25 |
| Puntaje Final | Número | 0-100 |
| Es Alerta | Booleano | SÍ/NO |
| Estado Alerta | Texto | pendiente/resuelta/N/A |
| Comentario | Texto | Texto libre |

**Nombre del archivo:** `reporte_bienestar_YYYYMMDD_HHMMSS.xlsx`

---

## 🎨 DISEÑO UI/UX ACTUALIZADO

### Paleta de Colores:

```css
/* Colores principales */
--primary-blue: #4A90E2;
--primary-green: #6BC4A6;
--accent-coral: #FF8B94;

/* Neutrals */
--gray-50: #FAFBFC;
--gray-100: #F5F7FA;
--gray-200: #E2E8F0;
--gray-600: #718096;
--gray-900: #2D3748;

/* Estados WHO-5 */
--alerta-red: #E53E3E;      /* < 13 puntos */
--bajo-yellow: #D69E2E;     /* 13-50 */
--medio-blue: #4A90E2;      /* 51-75 */
--alto-green: #38A169;      /* 76-100 */
```

### Componentes Clave:

#### 1. Escala de Respuesta WHO-5:

```
┌────────────────────────────────────────────────────────┐
│ Me he sentido alegre y de buen humor                   │
├────────────────────────────────────────────────────────┤
│                                                         │
│  ○          ○         ○         ○        ○        ○    │
│  5          4         3         2        1        0    │
│             │         │         │        │        │    │
│  Todo el   La      Más de    Menos    De vez   Nunca  │
│  tiempo    mayor    la        de la   en              │
│           parte   mitad     mitad   cuando            │
│           del    del       del                        │
│          tiempo  tiempo   tiempo                      │
│                                                         │
│  [────────────────────────────────────────────────]    │
│  ◀─────────── Mayor bienestar                         │
└────────────────────────────────────────────────────────┘
```

#### 2. Tarjeta de Resultado (Usuario):

```
┌──────────────────────────────────────────┐
│  ✓ Encuesta Completada                   │
├──────────────────────────────────────────┤
│                                           │
│  Tu Índice de Bienestar: 68/100          │
│                                           │
│  ████████████████░░░░  68%               │
│                                           │
│  🎯 Nivel: Buen Bienestar                │
│                                           │
│  Gracias por participar. Tu información  │
│  ayuda a mejorar el bienestar de toda    │
│  nuestra comunidad universitaria.        │
│                                           │
│  [Ver Recursos de Bienestar]             │
└──────────────────────────────────────────┘
```

#### 3. Tarjeta de Alerta (Puntaje < 13):

```
┌──────────────────────────────────────────┐
│  ⚠️ Resultado de tu Encuesta              │
├──────────────────────────────────────────┤
│                                           │
│  Hemos notado que tu nivel de bienestar  │
│  puede requerir atención.                │
│                                           │
│  Te invitamos a contactar al área de     │
│  Bienestar Universitario:                │
│                                           │
│  📞 Ext. 123                             │
│  📧 bienestar@uniempresarial.edu.co      │
│  🏢 Edificio A, Piso 2                   │
│                                           │
│  Horario: Lunes a Viernes 8am-5pm       │
│                                           │
│  [Agendar Cita] [Recursos de Apoyo]     │
└──────────────────────────────────────────┘
```

---

## ⚙️ CONFIGURACIÓN TÉCNICA

### Variables de Entorno Backend:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/bienestar_who5

# JWT
SECRET_KEY=your-super-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# CORS
ALLOWED_ORIGINS=http://localhost:5173,https://bienestar.uniempresarial.edu.co

# Email (para notificaciones)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=bienestar@uniempresarial.edu.co
SMTP_PASSWORD=your-app-password

# Universidad
UNIVERSIDAD_NOMBRE=Uniempresarial
DOMINIO_ESTUDIANTES=@estudiantes.uniempresarial.edu.co
DOMINIO_PERSONAL=@uniempresarial.edu.co

# WHO-5 Config
WHO5_UMBRAL_ALERTA=13
WHO5_CAMBIO_SIGNIFICATIVO=10
```

### Variables de Entorno Frontend:

```env
VITE_API_URL=http://localhost:8000/api
VITE_APP_NAME=Sistema de Bienestar Universitario
VITE_UNIVERSIDAD=Uniempresarial
```

---

## 📦 DEPENDENCIAS

### Backend (Python):

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
```

### Frontend (Node.js):

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.21.0",
    "@tanstack/react-query": "^5.17.0",
    "axios": "^1.6.5",
    "zustand": "^4.4.7",
    "zod": "^3.22.4",
    "react-hook-form": "^7.49.3",
    "@hookform/resolvers": "^3.3.4",
    "framer-motion": "^10.18.0",
    "lucide-react": "^0.303.0",
    "sonner": "^1.3.1",
    "clsx": "^2.1.0",
    "recharts": "^2.10.3",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-select": "^2.0.0"
  }
}
```

---

## 🔒 CONSIDERACIONES DE SEGURIDAD

### Validaciones Críticas:

1. **Correo institucional:**
   ```python
   def validar_correo_estudiante(email: str) -> bool:
       return email.endswith("@estudiantes.uniempresarial.edu.co")
   
   def validar_correo_personal(email: str) -> bool:
       return email.endswith("@uniempresarial.edu.co") and \
              not email.endswith("@estudiantes.uniempresarial.edu.co")
   ```

2. **Documento único:**
   - Verificar antes de insertar
   - Índice UNIQUE en base de datos
   - Mensaje claro si ya existe

3. **Passwords:**
   - Mínimo 8 caracteres
   - Al menos 1 mayúscula, 1 minúscula, 1 número
   - Hash con bcrypt (costo 12)

4. **Protección de datos:**
   - Nunca exponer documento completo en frontend
   - Mostrar solo: "CC ****7890"
   - Logs auditables de accesos

---

## 📈 MÉTRICAS DE ÉXITO

### KPIs del Proyecto:

1. **Adopción:**
   - Meta: >70% de la comunidad registrada en 6 meses
   - Actual: ____%

2. **Participación:**
   - Meta: >60% completan al menos 1 encuesta
   - Actual: ____%

3. **Retención:**
   - Meta: >40% completan encuesta cada mes
   - Actual: ____%

4. **Respuesta a Alertas:**
   - Meta: 100% de alertas atendidas en <72h
   - Actual: ____%

5. **Satisfacción:**
   - Meta: >80% encuentran útil el sistema
   - Actual: ____%

---

Esta especificación es la base para todo el desarrollo del sistema. 
Consultar con equipo de Bienestar antes de modificar aspectos clínicos.
