import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { authService } from '../services/authService';
import { useAuthStore } from '../stores/authStore';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  
  const loginMutation = useMutation({
    mutationFn: () => authService.login(correo, password),
    onSuccess: (data) => {
      login(data.access_token, data.usuario);
      toast.success('¡Bienvenido!');
      
      // Redirigir según rol
      if (['admin', 'psicologo', 'analista'].includes(data.usuario.rol)) {
        navigate('/dashboard');
      } else {
        navigate('/consentimiento');
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Error al iniciar sesión');
    }
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate();
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Iniciar Sesión</h1>
          <p className="text-gray-600 mt-2">Accede a tu cuenta</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Correo Institucional <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="usuario@estudiantes.uniempresarial.edu.co"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full py-3 px-6 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {loginMutation.isPending ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
            
            <div className="text-center text-sm text-gray-600">
              ¿No tienes cuenta?{' '}
              <Link to="/" className="text-blue-600 hover:underline font-medium">
                Regístrate aquí
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
