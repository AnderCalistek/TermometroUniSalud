import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { authService } from '../services/authService';
import type { RegistroPersonal } from '../types';

const esquemaRegistro = z.object({
  nombres: z.string().min(2, 'Mínimo 2 caracteres'),
  apellidos: z.string().min(2, 'Mínimo 2 caracteres'),
  tipo_documento: z.enum(['CC', 'TI']),
  numero_documento: z.string().min(6, 'Documento inválido'),
  correo_institucional: z.string()
    .email('Correo inválido')
    .endsWith('@uniempresarial.edu.co', 'Debe ser correo institucional'),
  password: z.string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener mayúscula')
    .regex(/[a-z]/, 'Debe contener minúscula')
    .regex(/[0-9]/, 'Debe contener número'),
  confirmar_password: z.string(),
  cargo: z.string().min(1, 'Selecciona un cargo')
}).refine((data) => data.password === data.confirmar_password, {
  message: "Las contraseñas no coinciden",
  path: ["confirmar_password"]
});

type FormData = z.infer<typeof esquemaRegistro>;

function obtenerMensajeError(error: any): string {
  const detail = error?.response?.data?.detail;

  if (Array.isArray(detail)) {
    return detail.map((item: any) => item?.msg).filter(Boolean).join(' | ');
  }

  if (typeof detail === 'string') {
    return detail;
  }

  return 'Error al registrar';
}

export function RegistroPersonalPage() {
  const navigate = useNavigate();
  
  const { data: cargos = [] } = useQuery({
    queryKey: ['cargos'],
    queryFn: authService.obtenerCargos
  });
  
  const registroMutation = useMutation({
    mutationFn: authService.registrarPersonal,
    onSuccess: () => {
      toast.success('¡Registro exitoso! Ya puedes iniciar sesión');
      navigate('/login');
    },
    onError: (error: any) => {
      toast.error(obtenerMensajeError(error));
    }
  });
  
  const { register, handleSubmit, formState: { errors, isValid } } = useForm<FormData>({
    resolver: zodResolver(esquemaRegistro),
    mode: 'onChange'
  });
  
  const onSubmit = (data: FormData) => {
    const { confirmar_password, ...datosRegistro } = data;
    registroMutation.mutate(datosRegistro as RegistroPersonal);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Registro de Personal Administrativo</h1>
          <p className="text-gray-600 mt-2">Crea tu cuenta institucional para acceder al sistema</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombres <span className="text-red-500">*</span>
              </label>
              <input {...register('nombres')} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              {errors.nombres && <p className="mt-1 text-sm text-red-600">{errors.nombres.message}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Apellidos <span className="text-red-500">*</span>
              </label>
              <input {...register('apellidos')} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              {errors.apellidos && <p className="mt-1 text-sm text-red-600">{errors.apellidos.message}</p>}
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo <span className="text-red-500">*</span></label>
                <select {...register('tipo_documento')} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option value="">Tipo</option>
                  <option value="CC">CC</option>
                  <option value="TI">TI</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Número de Documento <span className="text-red-500">*</span></label>
                <input {...register('numero_documento')} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Correo Institucional <span className="text-red-500">*</span>
              </label>
              <input {...register('correo_institucional')} type="email" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="maria.lopez@uniempresarial.edu.co" />
              {errors.correo_institucional && <p className="mt-1 text-sm text-red-600">{errors.correo_institucional.message}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cargo <span className="text-red-500">*</span>
              </label>
              <select {...register('cargo')} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                <option value="">Selecciona tu cargo</option>
                {cargos.map((cargo) => (
                  <option key={cargo} value={cargo}>{cargo}</option>
                ))}
              </select>
              {errors.cargo && <p className="mt-1 text-sm text-red-600">{errors.cargo.message}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña <span className="text-red-500">*</span>
              </label>
              <input {...register('password')} type="password" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              <p className="mt-1 text-xs text-gray-500">Mínimo 8 caracteres, incluye mayúscula, minúscula y número</p>
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar Contraseña <span className="text-red-500">*</span>
              </label>
              <input {...register('confirmar_password')} type="password" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              {errors.confirmar_password && <p className="mt-1 text-sm text-red-600">{errors.confirmar_password.message}</p>}
            </div>
            
            <div className="flex gap-4 pt-4">
              <Link to="/" className="flex-1 py-3 px-6 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 text-center">
                Cancelar
              </Link>
              <button type="submit" disabled={!isValid || registroMutation.isPending} className="flex-1 py-3 px-6 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed">
                {registroMutation.isPending ? 'Registrando...' : 'Registrarse'}
              </button>
            </div>
            
            <div className="text-center text-sm text-gray-600">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="text-indigo-600 hover:underline font-medium">Inicia sesión</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
