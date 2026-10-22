import axios from 'axios';

// ✅ En Vite se usa import.meta.env.MODE (devuelve 'production' o 'development')
export const BASE_URL = import.meta.env.MODE === 'production' 
    ? "https://alma-backend-1.onrender.com" 
    : "http://127.0.0.1:8000";

const api = axios.create({
    baseURL: BASE_URL,
});

// Tu interceptor se queda exactamente igual de mágico ✨
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Interceptor de respuesta: si el token venció o es inválido (401), redirige de inmediato al Login
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const url = error.config?.url || '';
        const esRutaPublicaAuth =
            url.includes('/login') ||
            url.includes('/auth/google') ||
            url.includes('/usuarios/vincular-google');

        if (status === 401 && !esRutaPublicaAuth) {
            localStorage.removeItem('token');
            localStorage.removeItem('userEmail');
            localStorage.removeItem('userName');
            localStorage.removeItem('userRole');
            localStorage.removeItem('clinicInviteCode');
            window.dispatchEvent(new Event('sesionExpirada'));
        }
        return Promise.reject(error);
    }
);

export default api;