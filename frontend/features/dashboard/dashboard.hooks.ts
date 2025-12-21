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
        enabled: true,
        retry: false,
    });

    return {
        user: userQuery.data,
        scenarios: scenariosQuery.data || [],
        simulations: simulationsQuery.data || [],
        isLoading: userQuery.isLoading,
        error: userQuery.error,
    };
};
