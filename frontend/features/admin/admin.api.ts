import apiClient from '@/lib/api-client';

export interface User {
    _id: string;
    username: string;
    email: string;
    role: string;
    createdAt?: string;
}

export const adminApi = {
    getAllUsers: async () => {
        const response = await apiClient.get<User[]>('/users');
        return response.data;
    },

    deleteUser: (userId: string) =>
        apiClient.delete(`/users/${userId}`),

    resetUserPassword: (userId: string, password: string) =>
        apiClient.post(`/users/${userId}/reset-password`, { password }),

    getAuditLogs: () =>
        apiClient.get('/audit/logs').then(res => res.data),
};
