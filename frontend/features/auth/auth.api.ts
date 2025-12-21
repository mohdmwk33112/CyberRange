import apiClient from '@/lib/api-client';
import { z } from 'zod';

// Zod schemas for validation
export const loginSchema = z.object({
    username: z.string().min(2),
    password: z.string().min(6),
});

export const signupSchema = z.object({
    username: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
});

export type LoginCredentials = z.infer<typeof loginSchema>;
export type SignupCredentials = z.infer<typeof signupSchema>;

// API methods
export const authApi = {
    login: async (credentials: LoginCredentials) => {
        // Adjust endpoint based on backend AuthModule
        const response = await apiClient.post('/auth/login', credentials);
        return response.data;
    },

    signup: async (credentials: SignupCredentials) => {
        const response = await apiClient.post('/auth/signup', credentials);
        return response.data;
    },

    getProfile: async () => {
        const response = await apiClient.get('/auth/profile');
        return response.data;
    },
};
