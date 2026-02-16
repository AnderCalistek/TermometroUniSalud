import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { dashboardService } from '../../services/dashboardService';
import { useAuthStore } from '../../stores/authStore';

export function DashboardPage() {
  const { user, logout } = useAuthStore();
  
  const { data: metricas, isLoading } = useQuery({
    queryKey: ['metricas', '30d'],
    queryFn: () => dashboardService.obtenerMetricas('30d')
  });
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Administrativo</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">{user?.nombres} {user?.apellidos}</span>
            <button
              onClick={logout}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Total Usuarios</h3>
            <p className="text-3xl font-bold text-gray-900">{metricas?.total_usuarios || 0}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Total Encuestas</h3>
            <p className="text-3xl font-bold text-gray-900">{metricas?.total_encuestas || 0}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Tasa Participación</h3>
            <p className="text-3xl font-bold text-gray-900">{metricas?.tasa_participacion || 0}%</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Puntaje Promedio</h3>
            <p className="text-3xl font-bold text-gray-900">{metricas?.puntaje_promedio || 0}</p>
          </div>
        </div>
        
        {/* Alertas */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Alertas</h2>
            <Link
              to="/dashboard/alertas"
              className="text-blue-600 hover:underline text-sm font-medium"
            >
              Ver todas →
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-600">{metricas?.alertas.activas || 0}</p>
              <p className="text-sm text-gray-600">Activas</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <p className="text-2xl font-bold text-yellow-600">{metricas?.alertas.pendientes || 0}</p>
              <p className="text-sm text-gray-600">Pendientes</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{metricas?.alertas.resueltas || 0}</p>
              <p className="text-sm text-gray-600">Resueltas</p>
            </div>
          </div>
        </div>
        
        {/* Distribución */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Distribución de Puntajes</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Alerta (0-12)</span>
                <span className="text-sm font-medium">{metricas?.distribucion_puntajes.alerta_0_12 || 0}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-red-600 h-2 rounded-full" style={{ width: `${((metricas?.distribucion_puntajes.alerta_0_12 || 0) / (metricas?.total_encuestas || 1)) * 100}%` }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Bajo (13-50)</span>
                <span className="text-sm font-medium">{metricas?.distribucion_puntajes.bajo_13_50 || 0}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-yellow-600 h-2 rounded-full" style={{ width: `${((metricas?.distribucion_puntajes.bajo_13_50 || 0) / (metricas?.total_encuestas || 1)) * 100}%` }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Medio (51-75)</span>
                <span className="text-sm font-medium">{metricas?.distribucion_puntajes.medio_51_75 || 0}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${((metricas?.distribucion_puntajes.medio_51_75 || 0) / (metricas?.total_encuestas || 1)) * 100}%` }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Alto (76-100)</span>
                <span className="text-sm font-medium">{metricas?.distribucion_puntajes.alto_76_100 || 0}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: `${((metricas?.distribucion_puntajes.alto_76_100 || 0) / (metricas?.total_encuestas || 1)) * 100}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
