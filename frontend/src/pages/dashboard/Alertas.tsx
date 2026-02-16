import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { dashboardService } from '../../services/dashboardService';
import { Link } from 'react-router-dom';

export function AlertasPage() {
  const queryClient = useQueryClient();
  
  const { data: alertas, isLoading } = useQuery({
    queryKey: ['alertas', 'all'],
    queryFn: () => dashboardService.obtenerAlertas('all')
  });
  
  const resolverMutation = useMutation({
    mutationFn: ({ id, accion }: { id: number; accion: string }) => 
      dashboardService.resolverAlerta(id, accion),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alertas'] });
      queryClient.invalidateQueries({ queryKey: ['metricas'] });
      toast.success('Alerta resuelta exitosamente');
    },
    onError: () => {
      toast.error('Error al resolver alerta');
    }
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
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Alertas</h1>
          <Link
            to="/dashboard"
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
          >
            ← Volver al Dashboard
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Puntaje</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prioridad</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {alertas?.map((alerta) => (
                <tr key={alerta.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {alerta.usuario.nombres} {alerta.usuario.apellidos}
                      </div>
                      <div className="text-sm text-gray-500">
                        {alerta.usuario.tipo_documento} {alerta.usuario.numero_documento}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${alerta.puntaje < 13 ? 'text-red-600' : 'text-gray-900'}`}>
                      {alerta.puntaje}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      alerta.prioridad === 'alta' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {alerta.prioridad}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      alerta.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                      alerta.estado === 'resuelta' ? 'bg-green-100 text-green-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {alerta.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(alerta.fecha_alerta).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {alerta.estado !== 'resuelta' && (
                      <button
                        onClick={() => {
                          const accion = prompt('Acción tomada:');
                          if (accion) {
                            resolverMutation.mutate({ id: alerta.id, accion });
                          }
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Resolver
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
