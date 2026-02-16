import { apiClient } from '../lib/api';
import type { Metricas, Alerta } from '../types';

export const dashboardService = {
  async obtenerMetricas(periodo: string = '30d', tipoUsuario?: string, programa?: string): Promise<Metricas> {
    const params = new URLSearchParams({ periodo });
    if (tipoUsuario) params.append('tipo_usuario', tipoUsuario);
    if (programa) params.append('programa', programa);
    
    const response = await apiClient.get(`/dashboard/metricas?${params.toString()}`);
    return response.data;
  },
  
  async obtenerAlertas(estado: string = 'all'): Promise<Alerta[]> {
    const response = await apiClient.get(`/dashboard/alertas?estado=${estado}`);
    return response.data;
  },
  
  async resolverAlerta(alertaId: number, accionTomada: string, notas?: string) {
    const response = await apiClient.patch(`/dashboard/alertas/${alertaId}/resolver`, null, {
      params: { accion_tomada: accionTomada, notas }
    });
    return response.data;
  },
  
  async exportarExcel(tipoUsuario?: string, programa?: string, esAlerta?: boolean): Promise<Blob> {
    const params = new URLSearchParams();
    if (tipoUsuario) params.append('tipo_usuario', tipoUsuario);
    if (programa) params.append('programa', programa);
    if (esAlerta !== undefined) params.append('es_alerta', esAlerta.toString());
    
    const response = await apiClient.get(`/dashboard/export/excel?${params.toString()}`, {
      responseType: 'blob'
    });
    return response.data;
  }
};
