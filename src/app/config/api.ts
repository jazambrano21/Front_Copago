// Configuración de API para conectar con backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const API_ENDPOINTS = {
  login: `${API_BASE_URL}/api/auth/login`,
  chat: `${API_BASE_URL}/api/chat`,
  pacientes: `${API_BASE_URL}/api/pacientes`,
  hospitales: `${API_BASE_URL}/api/hospitales`,
};

export default API_BASE_URL;
