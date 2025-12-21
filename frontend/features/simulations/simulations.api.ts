import apiClient from '@/lib/api-client';

export type SimulationStatus = 'Starting' | 'Running' | 'Completed' | 'Failed';

export interface Simulation {
    _id: string;
    scenarioId: string;
    scenarioName: string;
    userId: string;
    status: SimulationStatus;
    startedAt: string;
    completedAt?: string;
}

export const simulationsApi = {
    getActive: async (userId: string): Promise<Simulation[]> => {
        const response = await apiClient.get(`/simulations/user/${userId}/active`);
        return response.data;
    },

    getById: async (id: string): Promise<Simulation> => {
        const response = await apiClient.get(`/simulations/${id}`);
        return response.data;
    },
};
