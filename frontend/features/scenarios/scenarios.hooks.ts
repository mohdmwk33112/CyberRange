'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { scenariosApi, Scenario } from './scenarios.api';
import { useToast } from '@/hooks/use-toast';

export const useScenarios = () => {
    return useQuery({
        queryKey: ['scenarios'],
        queryFn: () => scenariosApi.getAll(),
    });
};

export const useScenario = (id: string) => {
    return useQuery({
        queryKey: ['scenario', id],
        queryFn: () => scenariosApi.getById(id),
        enabled: !!id,
    });
};

export const useScenarioState = (scenarioId: string, userId: string) => {
    return useQuery({
        queryKey: ['scenarioState', scenarioId, userId],
        queryFn: async () => {
            const response = await fetch(`http://localhost:3010/scenarios/${scenarioId}/state/${userId}`);
            return response.json();
        },
        enabled: !!scenarioId && !!userId,
    });
};

export const useValidateAnswer = () => {
    const { toast } = useToast();
    return useMutation({
        mutationFn: ({ scenarioId, userId, stepOrder, questionOrder, answer }: {
            scenarioId: string;
            userId: string;
            stepOrder: number;
            questionOrder: number;
            answer: string;
        }) => scenariosApi.validateAnswer(scenarioId, userId, stepOrder, questionOrder, answer),
        onError: (error) => {
            toast({
                title: 'Error',
                description: 'Failed to validate answer',
                variant: 'destructive',
            });
        },
    });
};

export const useCalculateScore = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ scenarioId, userId, answers }: {
            scenarioId: string;
            userId: string;
            answers: { stepOrder: number; questionOrder: number; answer: string }[];
        }) => scenariosApi.calculateScore(scenarioId, userId, answers),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['scenarioState', variables.scenarioId, variables.userId] });
        },
    });
};

export const useUnlockSimulation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ scenarioId, userId }: { scenarioId: string; userId: string }) =>
            scenariosApi.unlockSimulation(scenarioId, userId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['scenarioState', variables.scenarioId, variables.userId] });
        },
    });
};
