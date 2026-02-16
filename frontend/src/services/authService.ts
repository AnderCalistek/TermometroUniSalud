import { apiClient } from '../lib/api';
import type { RegistroEstudiante, RegistroPersonal, Usuario } from '../types';

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
