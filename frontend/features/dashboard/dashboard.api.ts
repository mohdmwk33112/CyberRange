import apiClient from '@/lib/api-client';

export interface UserProfile {
    _id: string;
    username: string;
    email: string;
    role: string;
    accountStatus: string;
}

export interface Progress {
    _id: string;
    userId: string;
    scenarioId: string;
    status: 'started' | 'completed' | 'failed';
    score: number;
    difficulty: 'easy' | 'medium' | 'hard';
    timestamp: string;
}

export const dashboardApi = {
    getUserProfile: async (userId: string): Promise<UserProfile> => {
        const response = await apiClient.get(`/users/profile/${userId}`);
        return response.data;
    },
    getUserProgress: async (userId: string): Promise<Progress[]> => {
        const response = await apiClient.get(`/users/progress/${userId}`);
        return response.data;
    },
};
