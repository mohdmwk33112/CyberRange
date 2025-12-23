'use client';

import React from 'react';
import { useClusterHealth } from '@/features/scenarios/scenarios.hooks';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Activity,
    ShieldCheck,
    AlertTriangle,
    RefreshCw,
    Server,
    Cpu,
    Box,
    Users,
    History as HistoryIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/features/auth/auth.store';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { UserManagement } from '@/features/admin/UserManagement';
import { AuditLogs } from '@/features/admin/AuditLogs';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";

export default function AdminDashboard() {
    const { data: pods, isLoading, error, refetch, isFetching } = useClusterHealth();
    const { toast } = useToast();
    const { user, isAuthenticated } = useAuthStore();
    const router = useRouter();
    const [isHydrated, setIsHydrated] = React.useState(false);

    useEffect(() => {
        setIsHydrated(true);
    }, []);

    useEffect(() => {
        if (!isHydrated) return;

        if (!isAuthenticated()) {
            router.push('/auth/login');
        } else if (user?.role !== 'admin') {
            toast({
                title: 'Access Denied',
                description: 'You must be an administrator to access this page.',
                variant: 'destructive',
            });
            router.push('/dashboard');
        }
    }, [isHydrated, isAuthenticated, user, router, toast]);

    // Simple authorized check to prevent flash of content
    if (!isHydrated || !isAuthenticated() || user?.role !== 'admin') {
        return null; // Or a loading spinner while redirecting
    }

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
                        <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} /> {/* Changed from RefreshCcw */}
                        {isFetching ? 'Refreshing...' : 'Refresh State'}
                    </Button>
                </div>

                <Tabs defaultValue="health" className="space-y-4">
                    <TabsList className="mb-8 p-1 bg-muted/30 border border-border/50">
                        <TabsTrigger value="health" className="gap-2 px-6">
                            <Server className="w-4 h-4" />
                            Infrastructure Health
                        </TabsTrigger>
                        <TabsTrigger value="users" className="gap-2 px-6">
                            <Users className="w-4 h-4" /> {/* Added Users icon */}
                            User Management
                        </TabsTrigger>
                        <TabsTrigger value="audit" className="gap-2 px-6">
                            <HistoryIcon className="w-4 h-4" /> {/* Changed from History to HistoryIcon */}
                            Login Activity
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="health" className="space-y-4">
                        {isLoading ? (
                            <Card className="p-12 flex flex-col items-center justify-center bg-muted/30 border-dashed">
                                <Activity className="w-10 h-10 text-primary animate-pulse mb-4" />
                                <p className="text-muted-foreground animate-pulse">Scanning cluster health...</p>
                            </Card>
                        ) : error ? (
                            <Card className="p-12 flex flex-col items-center justify-center bg-destructive/5 border-destructive/20 text-center">
                                <AlertTriangle className="w-10 h-10 text-destructive mb-4" />
                                <h3 className="text-lg font-bold mb-2">Failed to load cluster health</h3>
                                <p className="text-muted-foreground mb-6 max-w-md">
                                    There was an issue connecting to the Kubernetes health service.
                                    Ensure the API Gateway and cluster proxy are active.
                                </p>
                                <Button onClick={() => refetch()} variant="outline" className="gap-2">
                                    <RefreshCw className="w-4 h-4" />
                                    Retry Connection
                                </Button>
                            </Card>
                        ) : (
                            <>
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
                            </>
                        )}
                    </TabsContent>

                    <TabsContent value="users">
                        <UserManagement />
                    </TabsContent>

                    <TabsContent value="audit">
                        <AuditLogs />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
