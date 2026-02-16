# ⚛️ CÓDIGO COMPLETO FRONTEND - React + TypeScript
## Sistema de Bienestar WHO-5

---

## 📁 ESTRUCTURA DE ARCHIVOS

```
frontend/
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── lib/
│   │   └── api.ts
│   ├── stores/
│   │   └── authStore.ts
│   ├── services/
│   │   ├── authService.ts
│   │   ├── encuestaService.ts
│   │   └── dashboardService.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   └── useEncuesta.ts
│   ├── components/
│   │   ├── Layout.tsx
│   │   ├── DashboardLayout.tsx
│   │   ├── ProtectedRoute.tsx
│   │   └── ui/ (shadcn components)
│   ├── pages/
│   │   ├── Landing.tsx
│   │   ├── RegistroEstudiante.tsx
│   │   ├── RegistroPersonal.tsx
│   │   ├── Login.tsx
│   │   ├── Consentimiento.tsx
│   │   ├── EncuestaWHO5.tsx
│   │   ├── Resultado.tsx
│   │   └── dashboard/
│   │       ├── Dashboard.tsx
│   │       └── Alertas.tsx
│   └── types/
│       └── index.ts
├── package.json
└── vite.config.ts
```

---

## 📄 ARCHIVO 1: `src/types/index.ts`

```typescript
// Tipos de usuario
export type TipoUsuario = 'estudiante' | 'personal' | 'admin' | 'psicologo';
export type TipoDocumento = 'CC' | 'TI';
export type Rol = 'user' | 'admin' | 'psicologo' | 'analista';

// Usuario
export interface Usuario {
  id: number;
  tipo_usuario: TipoUsuario;
  nombres: string;
  apellidos: string;
  tipo_documento: TipoDocumento;
  numero_documento: string;
  correo_institucional: string;
  rol: Rol;
  programa?: string;
  promocion?: string;
  cargo?: string;
  consent_accepted: boolean;
  consent_date?: string;
  can_contact: boolean;
  created_at: string;
  last_login?: string;
}

// Registro
export interface RegistroEstudiante {
  nombres: string;
  apellidos: string;
  tipo_documento: TipoDocumento;
  numero_documento: string;
  correo_institucional: string;
  password: string;
  programa: string;
  promocion: string;
}

export interface RegistroPersonal {
  nombres: string;
  apellidos: string;
  tipo_documento: TipoDocumento;
  numero_documento: string;
  correo_institucional: string;
  password: string;
  cargo: string;
}

// WHO-5
export interface RespuestaWHO5 {
  pregunta_numero: number;
  valor: number; // 0-5
}

export interface EncuestaWHO5 {
  respuestas: RespuestaWHO5[];
  comentario?: string;
  can_contact: boolean;
}

export interface Encuesta {
  id: number;
  usuario_id: number;
  created_at: string;
  completed_at?: string;
  puntaje_raw: number;
  puntaje_final: number;
  es_alerta: boolean;
  comentario?: string;
  estado: string;
}

export interface ResultadoEncuesta {
  encuesta_id: number;
  fecha: string;
  puntaje_raw: number;
  puntaje_final: number;
  clasificacion: {
    nivel: string;
    categoria: string;
    color: string;
    mensaje: string;
  };
  es_alerta: boolean;
  cambio_significativo?: {
    hay_cambio: boolean;
    diferencia: number;
    tipo: 'mejora' | 'empeoramiento';
    puntaje_anterior: number;
  };
  comentario?: string;
}

// Pregunta WHO-5
export interface PreguntaWHO5 {
  numero: number;
  texto: string;
  opciones: {
    valor: number;
    label: string;
  }[];
}

// Dashboard
export interface Metricas {
  total_usuarios: number;
  total_encuestas: number;
  tasa_participacion: number;
  puntaje_promedio: number;
  alertas: {
    activas: number;
    pendientes: number;
    resueltas: number;
  };
  distribucion_puntajes: {
    alerta_0_12: number;
    bajo_13_50: number;
    medio_51_75: number;
    alto_76_100: number;
  };
}

export interface Alerta {
  id: number;
  encuesta_id: number;
  puntaje: number;
  prioridad: 'alta' | 'media';
  estado: 'pendiente' | 'en_atencion' | 'resuelta';
  usuario: {
    id: number;
    nombres: string;
    apellidos: string;
    tipo_documento: string;
    numero_documento: string;
    tipo_usuario: string;
    programa?: string;
    cargo?: string;
  };
  fecha_alerta: string;
  atendida_por?: number;
  fecha_atencion?: string;
  accion_tomada?: string;
}
```

---

## 📄 ARCHIVO 2: `src/lib/api.ts`

```typescript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

---

## 📄 ARCHIVO 3: `src/stores/authStore.ts`

```typescript
import create from 'zustand';
import { persist } from 'zustand/middleware';
import { Usuario } from '../types';

interface AuthState {
  token: string | null;
  user: Usuario | null;
  isAuthenticated: boolean;
  login: (token: string, user: Usuario) => void;
  logout: () => void;
  updateUser: (user: Partial<Usuario>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      
      login: (token, user) => {
        localStorage.setItem('authToken', token);
        set({ token, user, isAuthenticated: true });
      },
      
      logout: () => {
        localStorage.removeItem('authToken');
        set({ token: null, user: null, isAuthenticated: false });
      },
      
      updateUser: (userData) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null
        }));
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);
```

---

## 📄 ARCHIVO 4: `src/services/authService.ts`

```typescript
import { apiClient } from '../lib/api';
import { RegistroEstudiante, RegistroPersonal, Usuario } from '../types';

export const authService = {
  async registrarEstudiante(data: RegistroEstudiante): Promise<Usuario> {
    const response = await apiClient.post('/auth/registro/estudiante', data);
    return response.data;
  },
  
  async registrarPersonal(data: RegistroPersonal): Promise<Usuario> {
    const response = await apiClient.post('/auth/registro/personal', data);
    return response.data;
  },
  
  async login(correo: string, password: string) {
    const formData = new FormData();
    formData.append('username', correo);
    formData.append('password', password);
    
    const response = await apiClient.post('/auth/login', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
  
  async obtenerProgramas(): Promise<string[]> {
    const response = await apiClient.get('/auth/programas');
    return response.data.programas;
  },
  
  async obtenerCargos(): Promise<string[]> {
    const response = await apiClient.get('/auth/cargos');
    return response.data.cargos;
  }
};
```

---

## 📄 ARCHIVO 5: `src/services/encuestaService.ts`

```typescript
import { apiClient } from '../lib/api';
import { EncuestaWHO5, Encuesta, ResultadoEncuesta, PreguntaWHO5 } from '../types';

export const encuestaService = {
  async aceptarConsentimiento(canContact: boolean) {
    const response = await apiClient.post('/encuestas/consentimiento', null, {
      params: { can_contact: canContact }
    });
    return response.data;
  },
  
  async obtenerPreguntas(): Promise<{ preguntas: PreguntaWHO5[] }> {
    const response = await apiClient.get('/encuestas/preguntas');
    return response.data;
  },
  
  async enviarEncuesta(data: EncuestaWHO5): Promise<Encuesta> {
    const response = await apiClient.post('/encuestas/', data);
    return response.data;
  },
  
  async obtenerMisEncuestas(): Promise<Encuesta[]> {
    const response = await apiClient.get('/encuestas/mis-encuestas');
    return response.data;
  },
  
  async obtenerResultado(encuestaId: number): Promise<ResultadoEncuesta> {
    const response = await apiClient.get(`/encuestas/${encuestaId}/resultado`);
    return response.data;
  }
};
```

---

## 📄 ARCHIVO 6: `src/pages/RegistroEstudiante.tsx`

```typescript
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { authService } from '../services/authService';
import { RegistroEstudiante } from '../types';

const esquemaRegistro = z.object({
  nombres: z.string().min(2, 'Mínimo 2 caracteres'),
  apellidos: z.string().min(2, 'Mínimo 2 caracteres'),
  tipo_documento: z.enum(['CC', 'TI']),
  numero_documento: z.string().min(6, 'Documento inválido'),
  correo_institucional: z.string()
    .email('Correo inválido')
    .endsWith('@estudiantes.uniempresarial.edu.co', 'Debe ser correo institucional de estudiante'),
  password: z.string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener mayúscula')
    .regex(/[a-z]/, 'Debe contener minúscula')
    .regex(/[0-9]/, 'Debe contener número'),
  confirmar_password: z.string(),
  programa: z.string().min(1, 'Selecciona un programa'),
  promocion: z.string().regex(/^\d{4}-[12]$/, 'Formato: YYYY-1 o YYYY-2')
}).refine((data) => data.password === data.confirmar_password, {
  message: "Las contraseñas no coinciden",
  path: ["confirmar_password"]
});

type FormData = z.infer<typeof esquemaRegistro>;

export function RegistroEstudiantePage() {
  const navigate = useNavigate();
  
  const { data: programas = [] } = useQuery({
    queryKey: ['programas'],
    queryFn: authService.obtenerProgramas
  });
  
  const registroMutation = useMutation({
    mutationFn: authService.registrarEstudiante,
    onSuccess: () => {
      toast.success('¡Registro exitoso! Ya puedes iniciar sesión');
      navigate('/login');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Error al registrar');
    }
  });
  
  const { register, handleSubmit, formState: { errors, isValid } } = useForm<FormData>({
    resolver: zodResolver(esquemaRegistro),
    mode: 'onChange'
  });
  
  const onSubmit = (data: FormData) => {
    const { confirmar_password, ...datosRegistro } = data;
    registroMutation.mutate(datosRegistro as RegistroEstudiante);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Registro de Estudiante</h1>
          <p className="text-gray-600 mt-2">Crea tu cuenta para acceder al sistema</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Nombres */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombres <span className="text-red-500">*</span>
              </label>
              <input
                {...register('nombres')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Juan Carlos"
              />
              {errors.nombres && (
                <p className="mt-1 text-sm text-red-600">{errors.nombres.message}</p>
              )}
            </div>
            
            {/* Apellidos */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Apellidos <span className="text-red-500">*</span>
              </label>
              <input
                {...register('apellidos')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Pérez García"
              />
              {errors.apellidos && (
                <p className="mt-1 text-sm text-red-600">{errors.apellidos.message}</p>
              )}
            </div>
            
            {/* Documento */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('tipo_documento')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Tipo</option>
                  <option value="CC">CC</option>
                  <option value="TI">TI</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Documento <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('numero_documento')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="1234567890"
                />
              </div>
            </div>
            {errors.numero_documento && (
              <p className="mt-1 text-sm text-red-600">{errors.numero_documento.message}</p>
            )}
            
            {/* Correo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Correo Institucional <span className="text-red-500">*</span>
              </label>
              <input
                {...register('correo_institucional')}
                type="email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="juan.perez@estudiantes.uniempresarial.edu.co"
              />
              {errors.correo_institucional && (
                <p className="mt-1 text-sm text-red-600">{errors.correo_institucional.message}</p>
              )}
            </div>
            
            {/* Programa */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Programa Académico <span className="text-red-500">*</span>
              </label>
              <select
                {...register('programa')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecciona tu programa</option>
                {programas.map((prog) => (
                  <option key={prog} value={prog}>{prog}</option>
                ))}
              </select>
              {errors.programa && (
                <p className="mt-1 text-sm text-red-600">{errors.programa.message}</p>
              )}
            </div>
            
            {/* Promoción */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Promoción <span className="text-red-500">*</span>
              </label>
              <input
                {...register('promocion')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="2024-1"
              />
              <p className="mt-1 text-xs text-gray-500">Formato: YYYY-1 o YYYY-2</p>
              {errors.promocion && (
                <p className="mt-1 text-sm text-red-600">{errors.promocion.message}</p>
              )}
            </div>
            
            {/* Contraseña */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña <span className="text-red-500">*</span>
              </label>
              <input
                {...register('password')}
                type="password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Mínimo 8 caracteres, incluye mayúscula, minúscula y número
              </p>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>
            
            {/* Confirmar Contraseña */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar Contraseña <span className="text-red-500">*</span>
              </label>
              <input
                {...register('confirmar_password')}
                type="password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              {errors.confirmar_password && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmar_password.message}</p>
              )}
            </div>
            
            {/* Botones */}
            <div className="flex gap-4 pt-4">
              <Link
                to="/"
                className="flex-1 py-3 px-6 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 text-center"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={!isValid || registroMutation.isPending}
                className="flex-1 py-3 px-6 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {registroMutation.isPending ? 'Registrando...' : 'Registrarse'}
              </button>
            </div>
            
            <div className="text-center text-sm text-gray-600">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="text-blue-600 hover:underline font-medium">
                Inicia sesión
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
```

---

**CONTINÚA EN FRONTEND_CODIGO_COMPLETO_PARTE2.md con más páginas...**
