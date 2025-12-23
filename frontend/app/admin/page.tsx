'use client';

import React from 'react';
import { useClusterHealth } from '@/features/scenarios/scenarios.hooks';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Activity,
    ShieldCheck,
    AlertTriangle,
    RefreshCcw,
    Server,
    Cpu,
    Box
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function AdminDashboard() {
    const { data: pods, isLoading, error, refetch, isFetching } = useClusterHealth();
    const { toast } = useToast();

    const handleRefresh = async () => {
        try {
            await refetch();
            toast({
                title: 'Data Refreshed',
                description: 'Latest cluster health data has been fetched.',
            });
        } catch (e) {
            toast({
                title: 'Refresh Failed',
                description: 'Could not connect to the cluster. Please try again.',
                variant: 'destructive',
            });
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background p-6">
                <Activity className="w-12 h-12 text-primary animate-pulse mb-4" />
                <p className="text-muted-foreground animate-pulse">Scanning cluster health...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background p-6">
                <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
                <h1 className="text-xl font-bold mb-2">Failed to load cluster health</h1>
                <p className="text-muted-foreground mb-6">Make sure the backend is running and you have cluster access.</p>
                <Button onClick={() => refetch()}>Try Again</Button>
            </div>
        );
    }

    const getStatusColor = (status: string, ready: boolean) => {
        if (!ready) return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/50';
        switch (status) {
            case 'Running': return 'bg-green-500/10 text-green-500 border-green-500/50';
            case 'Pending': return 'bg-blue-500/10 text-blue-500 border-blue-500/50';
            case 'Failed': return 'bg-destructive/10 text-destructive border-destructive/50';
            default: return 'bg-muted text-muted-foreground border-border';
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
                            <ShieldCheck className="w-8 h-8 text-primary" />
                            Admin Operations
                        </h1>
                        <p className="text-muted-foreground">
                            Real-time monitoring of Kubernetes simulation containers and infrastructure.
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 border-primary/20 hover:bg-primary/10"
                        onClick={handleRefresh}
                        disabled={isFetching}
                    >
                        <RefreshCcw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
                        {isFetching ? 'Refreshing...' : 'Refresh State'}
                    </Button>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <Card className="p-4 bg-muted/30 border-border/50 flex items-center gap-4">
                        <div className="p-2 bg-primary/20 rounded-lg">
                            <Server className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground uppercase font-semibold">Total Containers</p>
                            <p className="text-2xl font-bold">{pods?.length || 0}</p>
                        </div>
                    </Card>
                    <Card className="p-4 bg-muted/30 border-border/50 flex items-center gap-4">
                        <div className="p-2 bg-green-500/20 rounded-lg">
                            <ShieldCheck className="w-5 h-5 text-green-500" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground uppercase font-semibold">Healthy</p>
                            <p className="text-2xl font-bold text-green-500">
                                {pods?.filter((p: any) => p.status === 'Running' && p.ready).length || 0}
                            </p>
                        </div>
                    </Card>
                    <Card className="p-4 bg-muted/30 border-border/50 flex items-center gap-4">
                        <div className="p-2 bg-yellow-500/20 rounded-lg">
                            <Activity className="w-5 h-5 text-yellow-500" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground uppercase font-semibold">Transitioning</p>
                            <p className="text-2xl font-bold text-yellow-500">
                                {pods?.filter((p: any) => p.status === 'Pending' || (p.status === 'Running' && !p.ready)).length || 0}
                            </p>
                        </div>
                    </Card>
                    <Card className="p-4 bg-muted/30 border-border/50 flex items-center gap-4">
                        <div className="p-2 bg-destructive/20 rounded-lg">
                            <AlertTriangle className="w-5 h-5 text-destructive" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground uppercase font-semibold">Issues</p>
                            <p className="text-2xl font-bold text-destructive">
                                {pods?.filter((p: any) => p.status === 'Failed' || p.restarts > 5).length || 0}
                            </p>
                        </div>
                    </Card>
                </div>

                {/* Pod Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {pods?.map((pod: any) => (
                        <Card key={pod.name} className="bg-card border-border/50 overflow-hidden hover:border-primary/30 transition-colors group">
                            <div className="p-5">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-md ${pod.ready ? 'bg-primary/10' : 'bg-muted'}`}>
                                            <Box className={`w-5 h-5 ${pod.ready ? 'text-primary' : 'text-muted-foreground'}`} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-sm truncate max-w-[180px]" title={pod.name}>
                                                {pod.name}
                                            </h3>
                                            <p className="text-[10px] text-muted-foreground font-mono">
                                                {new Date(pod.creationTimestamp).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className={`text-[10px] ${getStatusColor(pod.status, pod.ready)}`}>
                                        {pod.ready ? 'READY' : 'NOT READY'}
                                    </Badge>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-muted-foreground">Image:</span>
                                        <span className="font-mono text-[10px] bg-muted/50 px-2 py-0.5 rounded border border-border/30 max-w-[200px] truncate" title={pod.image}>
                                            {pod.image?.split('/').pop()}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-muted-foreground">Phase:</span>
                                        <span className={`font-semibold ${pod.status === 'Running' ? 'text-green-500' : 'text-yellow-500'}`}>
                                            {pod.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-muted-foreground">Restarts:</span>
                                        <span className={`font-bold ${pod.restarts > 0 ? 'text-destructive' : 'text-foreground'}`}>
                                            {pod.restarts}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Labels footer */}
                            <div className="px-5 py-3 bg-muted/10 border-t border-border/50 flex flex-wrap gap-1.5">
                                {pod.labels?.['cyberrange.io/scenario'] && (
                                    <Badge className="bg-primary/5 text-primary border-primary/20 text-[9px] h-4">
                                        scenario: {pod.labels['cyberrange.io/scenario']}
                                    </Badge>
                                )}
                                {pod.labels?.['app'] && (
                                    <Badge variant="secondary" className="text-[9px] h-4">
                                        app: {pod.labels['app']}
                                    </Badge>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
