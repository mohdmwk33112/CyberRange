import apiClient from '@/lib/api-client';

export const userApi = {
    getProfile: async (userId: string) => {
        const response = await apiClient.get(`/users/profile/${userId}`);
        return response.data;
    },

    updateProfile: async (userId: string, data: { username?: string; email?: string }) => {
        const response = await apiClient.put(`/users/profile/${userId}`, data);
        return response.data;
    },

    deleteAccount: async (userId: string) => {
        const response = await apiClient.delete(`/users/${userId}`);
        return response.data;
    },

    changePassword: async (userId: string, password: string) => {
        const response = await apiClient.post(`/users/${userId}/reset-password`, { password });
        return response.data;
    },
};
