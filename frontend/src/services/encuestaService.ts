import { apiClient } from '../lib/api';
import type { EncuestaWHO5, Encuesta, ResultadoEncuesta, PreguntaWHO5 } from '../types';

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
