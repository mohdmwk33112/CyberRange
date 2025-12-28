import axios from 'axios';
import { useAuthStore } from '@/features/auth/auth.store';

const apiClient = axios.create({
    baseURL: 'http://localhost:3010', // API Gateway URL
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // For cookies if needed, or we attach token manually
});

apiClient.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default apiClient;
