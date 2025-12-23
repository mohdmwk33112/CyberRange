import apiClient from '@/lib/api-client';

export interface Scenario {
    _id: string;
    title: string;
    description: string;
    difficulty: 'easy' | 'medium' | 'hard';
    category: string;
    estimatedTime: number;
    attackType: string;
    steps: any[];
}

export const scenariosApi = {
    getAll: async (): Promise<Scenario[]> => {
        const response = await apiClient.get('/scenarios');
        return response.data;
    },

    getById: async (id: string): Promise<Scenario> => {
        const response = await apiClient.get(`/scenarios/${id}`);
        return response.data;
    },

    // Questionnaire methods
    validateAnswer: async (
        scenarioId: string,
        userId: string,
        stepOrder: number,
        questionOrder: number,
        answer: string
    ) => {
        const response = await apiClient.post(`/scenarios/${scenarioId}/validate-answer`, {
            userId,
            stepOrder,
            questionOrder,
            answer,
        });
        return response.data;
    },

    calculateScore: async (
        scenarioId: string,
        userId: string,
        answers: { stepOrder: number; questionOrder: number; answer: string }[]
    ) => {
        const response = await apiClient.post(`/scenarios/${scenarioId}/calculate-score`, {
            userId,
            answers,
        });
        return response.data;
    },

    checkEligibility: async (scenarioId: string, userId: string) => {
        const response = await apiClient.get(`/scenarios/${scenarioId}/simulation-eligibility/${userId}`);
        return response.data;
    },

    unlockSimulation: async (scenarioId: string, userId: string) => {
        const response = await apiClient.post(`/scenarios/${scenarioId}/unlock-simulation/${userId}`);
        return response.data;
    },

    resetQuestionnaire: async (scenarioId: string, userId: string) => {
        const response = await apiClient.post(`/scenarios/${scenarioId}/reset-questionnaire/${userId}`);
        return response.data;
    },

    getClusterHealth: async () => {
        const response = await apiClient.get('/simulations/cluster/health');
        return response.data;
    },
};
