import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { authService } from '../services/authService';
import type { RegistroEstudiante } from '../types';

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
