import apiClient from '@/lib/api-client';

export interface UserProfile {
    _id: string;
    username: string;
    email: string;
    role: string;
    accountStatus: string;
}

export const dashboardApi = {
    getUserProfile: async (userId: string): Promise<UserProfile> => {
        const response = await apiClient.get(`/users/profile/${userId}`);
        return response.data;
    },
};
