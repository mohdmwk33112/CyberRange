'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, ShieldAlert, ShieldCheck, RefreshCw, Clock, Activity } from 'lucide-react';

interface VictimHealth {
    status: 'healthy' | 'degraded' | 'critical' | 'unhealthy' | 'error';
    podName?: string;
    phase?: string;
    restarts?: number;
    ready?: boolean;
    creationTimestamp?: string;
    message?: string;
}

interface VictimHealthMetricsProps {
    health: VictimHealth | null;
}

export const VictimHealthMetrics: React.FC<VictimHealthMetricsProps> = ({ health }) => {
    if (!health) {
        return (
            <Card className="bg-card/50 border-border/50 overflow-hidden">
                <CardContent className="p-4 flex flex-col items-center justify-center h-32 text-muted-foreground animate-pulse">
                    <Activity className="w-6 h-6 mb-2 opacity-20" />
                    <span className="text-xs font-bold uppercase tracking-widest">Initializing Monitoring...</span>
                </CardContent>
            </Card>
        );
    }

    const getStatusColor = () => {
        switch (health.status) {
            case 'healthy': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
            case 'degraded': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
            case 'critical':
            case 'unhealthy':
            case 'error': return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
            default: return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
        }
    };

    const StatusIcon = () => {
        if (health.status === 'healthy') return <ShieldCheck className="w-5 h-5 text-emerald-500" />;
        if (health.status === 'degraded') return <ShieldAlert className="w-5 h-5 text-amber-500" />;
        return <ShieldAlert className="w-5 h-5 text-rose-500" />;
    };

    const getUptime = () => {
        if (!health.creationTimestamp) return 'N/A';
        const start = new Date(health.creationTimestamp).getTime();
        const now = Date.now();
        const diff = Math.floor((now - start) / 1000); // seconds

        if (diff < 60) return `${diff}s`;
        if (diff < 3600) return `${Math.floor(diff / 60)}m ${diff % 60}s`;
        return `${Math.floor(diff / 3600)}h ${Math.floor((diff % 3600) / 60)}m`;
    };

    return (
        <Card className="bg-card/50 border-border/50 overflow-hidden shadow-lg">
            <div className={`h-1 w-full ${health.status === 'healthy' ? 'bg-emerald-500' : health.status === 'degraded' ? 'bg-amber-500' : 'bg-rose-500'}`} />
            <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <StatusIcon />
                        <span className="text-sm font-bold tracking-tight">System Health</span>
                    </div>
                    <Badge variant="outline" className={`${getStatusColor()} border uppercase text-[10px] font-bold tracking-widest px-2 py-0.5`}>
                        {health.status}
                    </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1 font-mono">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                            <RefreshCw className="w-3 h-3" />
                            <span className="text-[10px] uppercase font-bold tracking-tight">Restarts</span>
                        </div>
                        <div className="text-xl font-bold text-foreground pl-4">
                            {health.restarts ?? 0}
                        </div>
                    </div>
                    <div className="space-y-1 font-mono">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span className="text-[10px] uppercase font-bold tracking-tight">Uptime</span>
                        </div>
                        <div className="text-xl font-bold text-foreground pl-4">
                            {getUptime()}
                        </div>
                    </div>
                </div>

                {health.message && health.status !== 'healthy' && (
                    <div className="bg-rose-500/5 border border-rose-500/10 rounded p-2 text-[10px] text-rose-400 font-medium italic">
                        {health.message}
                    </div>
                )}

                <div className="flex items-center gap-2 pt-2 border-t border-border/40">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">Target: juice-shop-node</span>
                </div>
            </CardContent>
        </Card>
    );
};
