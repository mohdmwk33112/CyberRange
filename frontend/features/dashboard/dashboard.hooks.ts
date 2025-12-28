'use client';

import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from './dashboard.api';
import { scenariosApi } from '@/features/scenarios/scenarios.api';
import { simulationsApi } from '@/features/simulations/simulations.api';

export const useDashboardData = (userId: string) => {
    const userQuery = useQuery({
        queryKey: ['user', userId],
        queryFn: () => dashboardApi.getUserProfile(userId),
        enabled: !!userId,
    });

    const scenariosQuery = useQuery({
        queryKey: ['scenarios'],
        queryFn: () => scenariosApi.getAll(),
        retry: false,
        enabled: true,
    });

    const simulationsQuery = useQuery({
        queryKey: ['simulations', userId],
        queryFn: () => simulationsApi.getActive(userId),
        enabled: !!userId,
        retry: false,
    });

    const progressQuery = useQuery({
        queryKey: ['progress', userId],
        queryFn: () => dashboardApi.getUserProgress(userId),
        enabled: !!userId,
        retry: false,
    });

    return {
        userProfile: userQuery.data,
        scenarios: scenariosQuery.data || [],
        simulations: simulationsQuery.data || [],
        progress: progressQuery.data || [],
        isLoading: userQuery.isLoading || scenariosQuery.isLoading || simulationsQuery.isLoading || progressQuery.isLoading,
        error: userQuery.error || scenariosQuery.error || simulationsQuery.error || progressQuery.error,
        refetch: userQuery.refetch,
    };
};
