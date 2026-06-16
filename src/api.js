import axios from 'axios';

// ✅ En Vite se usa import.meta.env.MODE (devuelve 'production' o 'development')
const BASE_URL = import.meta.env.MODE === 'production' 
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

export default api;