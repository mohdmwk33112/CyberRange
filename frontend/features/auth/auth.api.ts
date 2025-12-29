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
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters long')
        .max(20, 'Password cannot exceed 20 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
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
