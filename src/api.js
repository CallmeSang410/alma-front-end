import axios from 'axios';

const BASE_URL = process.env.NODE_ENV === 'production' 
    ? "https://alma-backend-1.onrender.com" 
    : "http://127.0.0.1:8000";

const api = axios.create({
    baseURL: BASE_URL,
});

// Esto es la magia: intercepta cada petición y le mete el token automáticamente
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;